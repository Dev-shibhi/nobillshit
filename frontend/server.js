const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const OpenAI = require('openai');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const emailTransporter = process.env.EMAIL_USER ? nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
}) : null;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB error:', err));

// Models
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  googleId: String,
  role: { type: String, default: 'user' },
  isPremium: { type: Boolean, default: false },
  premiumPlan: String,
  status: { type: String, default: 'active' },
  analysisCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const otpSchema = new mongoose.Schema({
  email: String,
  code: String,
  expiresAt: Date,
  verified: { type: Boolean, default: false }
});

const reportSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  fileName: String,
  analysis: Object,
  totalAmount: String,
  potentialSavings: String,
  issuesCount: Number,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const OTP = mongoose.model('OTP', otpSchema);
const Report = mongoose.model('Report', reportSchema);

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    if (!req.user || req.user.status === 'blocked') return res.status(401).json({ error: 'Unauthorized' });
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

// Routes
app.post('/api/auth/google', async (req, res) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { sub, email, name } = ticket.getPayload();
    
    let user = await User.findOne({ $or: [{ googleId: sub }, { email }] });
    if (!user) {
      user = await User.create({ googleId: sub, email, name });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isPremium: user.isPremium } });
  } catch (err) {
    res.status(500).json({ error: 'Auth failed' });
  }
});

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.includes('@')) return res.status(400).json({ error: 'Invalid email' });
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, code, expiresAt: new Date(Date.now() + 600000) });
    
    if (emailTransporter) {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'NoBillShit - Verification Code',
        html: `<h2>Your code: ${code}</h2><p>Valid for 10 minutes</p>`
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    const otp = await OTP.findOne({ email, code, verified: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!otp) return res.status(400).json({ error: 'Invalid OTP' });
    
    otp.verified = true;
    await otp.save();
    
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name: email.split('@')[0] });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isPremium: user.isPremium } });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, isPremium: req.user.isPremium } });
});

app.post('/api/analysis/analyze', auth, upload.single('bill'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    let textContent = '', base64Image = '';
    
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(await fs.readFile(req.file.path));
      textContent = data.text;
    } else {
      base64Image = (await fs.readFile(req.file.path)).toString('base64');
    }
    
    const messages = req.file.mimetype === 'application/pdf'
      ? [{ role: 'user', content: `Analyze this bill. Return JSON with: billType, totalAmount (number), summary, keyCharges[], potentialIssues[], savingsOpportunities[], nextActions[]\n\n${textContent}` }]
      : [{ role: 'user', content: [
          { type: 'text', text: 'Analyze this bill. Return JSON with: billType, totalAmount (number), summary, keyCharges[], potentialIssues[], savingsOpportunities[], nextActions[]' },
          { type: 'image_url', image_url: { url: `data:${req.file.mimetype};base64,${base64Image}` }}
        ]}];
    
    const response = await openai.chat.completions.create({ model: 'gpt-4o', messages, max_tokens: 2000 });
    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);
    const data = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    
    const analysis = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      fileName: req.file.originalname,
      billType: data.billType || 'Bill',
      totalAmount: Number(data.totalAmount || 0).toFixed(2),
      summary: data.summary || 'Complete',
      keyCharges: data.keyCharges || [],
      potentialIssues: data.potentialIssues || [],
      savingsOpportunities: data.savingsOpportunities || [],
      nextActions: data.nextActions || [],
      potentialSavings: (data.savingsOpportunities?.reduce((s, o) => s + (Number(o.savings) || 0), 0) || 0).toFixed(2),
      issuesCount: data.potentialIssues?.length || 0
    };
    
    await Report.create({ userId: req.user._id, fileName: req.file.originalname, analysis, totalAmount: analysis.totalAmount, potentialSavings: analysis.potentialSavings, issuesCount: analysis.issuesCount });
    req.user.analysisCount += 1;
    await req.user.save();
    await fs.unlink(req.file.path);
    
    res.json({ success: true, analysis });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.get('/api/reports', auth, async (req, res) => {
  const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, reports });
});

app.delete('/api/reports/:id', auth, async (req, res) => {
  await Report.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true });
});

app.get('/api/admin/users', auth, adminAuth, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});

app.patch('/api/admin/users/:id', auth, adminAuth, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, user });
});

app.delete('/api/admin/users/:id', auth, adminAuth, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get('/api/admin/stats', auth, adminAuth, async (req, res) => {
  res.json({
    totalUsers: await User.countDocuments(),
    premiumUsers: await User.countDocuments({ isPremium: true }),
    blockedUsers: await User.countDocuments({ status: 'blocked' }),
    totalAnalyses: await Report.countDocuments()
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 3001, () => console.log('✓ Server running'));
