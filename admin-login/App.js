import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Upload, FileText, DollarSign, AlertTriangle, CheckCircle, TrendingUp, Shield, Users, Crown, Lock, Trash2, Eye, Settings, Search, Sparkles, Home, BarChart3, X, Menu, LogIn, Mail } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [page, setPage] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/me`);
      setUser(data.user);
    } catch (err) {
      logout();
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setPage('home');
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/google`, { token: credentialResponse.credential });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setShowAuth(false);
      if (page === 'admin-login' && data.user.role === 'admin') {
        setPage('admin');
      }
      window.location.reload();
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/send-otp`, { email });
      setOtpSent(true);
      alert('OTP sent to your email');
    } catch (err) {
      alert('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, { email, code: otp });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setShowAuth(false);
      setOtpSent(false);
      setEmail('');
      setOtp('');
      if (page === 'admin-login' && data.user.role === 'admin') {
        setPage('admin');
      }
      window.location.reload();
    } catch (err) {
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const analyzeBill = async (file) => {
    try {
      setAnalyzing(true);
      const formData = new FormData();
      formData.append('bill', file);
      const { data } = await axios.post(`${API_URL}/analysis/analyze`, formData);
      setAnalysis(data.analysis);
      setPage('results');
    } catch (err) {
      alert('Analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchReports = async () => {
    const { data } = await axios.get(`${API_URL}/reports`);
    setReports(data.reports);
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    await axios.delete(`${API_URL}/reports/${id}`);
    fetchReports();
  };

  const fetchAdminData = async () => {
    const [usersRes, statsRes] = await Promise.all([
      axios.get(`${API_URL}/admin/users`),
      axios.get(`${API_URL}/admin/stats`)
    ]);
    setUsers(usersRes.data.users);
    setStats(statsRes.data);
  };

  const updateUser = async (userId, updates) => {
    await axios.patch(`${API_URL}/admin/users/${userId}`, updates);
    fetchAdminData();
    setEditingUser(null);
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`${API_URL}/admin/users/${userId}`);
    fetchAdminData();
  };

  useEffect(() => {
    if (user && page === 'dashboard') fetchReports();
    if (user?.role === 'admin' && page === 'admin') fetchAdminData();
  }, [page, user]);

  const Header = () => (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div onClick={() => setPage('home')} className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NoBillShit</span>
        </div>

        {user ? (
          <>
            <nav className="hidden md:flex gap-4">
              <button onClick={() => setPage('home')} className={`px-4 py-2 rounded-lg transition ${page === 'home' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Home className="w-4 h-4 inline mr-2" />Home
              </button>
              <button onClick={() => setPage('dashboard')} className={`px-4 py-2 rounded-lg transition ${page === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <BarChart3 className="w-4 h-4 inline mr-2" />Dashboard
              </button>
              {user.role === 'admin' && (
                <button onClick={() => setPage('admin')} className={`px-4 py-2 rounded-lg transition ${page === 'admin' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <Shield className="w-4 h-4 inline mr-2" />Admin
                </button>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm font-medium">{user.name}</span>
              {user.isPremium && <Crown className="w-4 h-4 text-yellow-600" />}
              <button onClick={logout} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Logout</button>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2">
                {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => setShowAuth(true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
              Sign In
            </button>
            {page !== 'admin-login' && (
              <button onClick={() => setPage('admin-login')} className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition">
                Admin
              </button>
            )}
          </div>
        )}
      </div>
      {mobileMenu && user && (
        <div className="md:hidden border-t bg-white p-4">
          <button onClick={() => { setPage('home'); setMobileMenu(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">Home</button>
          <button onClick={() => { setPage('dashboard'); setMobileMenu(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">Dashboard</button>
          {user.role === 'admin' && (
            <button onClick={() => { setPage('admin'); setMobileMenu(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">Admin</button>
          )}
        </div>
      )}
    </header>
  );

  const Footer = () => (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">NoBillShit</span>
            </div>
            <p className="text-gray-400 text-sm">Stop overpaying on your bills with AI-powered analysis.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button onClick={() => setPage('home')} className="hover:text-white transition">How it Works</button></li>
              <li><button className="hover:text-white transition">Pricing</button></li>
              <li><button className="hover:text-white transition">Features</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button className="hover:text-white transition">About</button></li>
              <li><button className="hover:text-white transition">Blog</button></li>
              <li><button className="hover:text-white transition">Contact</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button className="hover:text-white transition">Privacy</button></li>
              <li><button className="hover:text-white transition">Terms</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© 2025 NoBillShit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{page === 'admin-login' ? 'Admin Login' : 'Sign In'}</h2>
          <button onClick={() => setShowAuth(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setAuthMode('google')} className={`flex-1 py-2 rounded-lg transition ${authMode === 'google' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Google</button>
            <button onClick={() => setAuthMode('email')} className={`flex-1 py-2 rounded-lg transition ${authMode === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Email</button>
          </div>

          {authMode === 'google' ? (
            <div className="text-center">
              <GoogleLogin 
                onSuccess={handleGoogleLogin} 
                onError={() => alert('Login failed')}
                useOneTap={false}
                theme="filled_blue"
                size="large"
              />
            </div>
          ) : (
            <>
              {!otpSent ? (
                <>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={sendOTP} disabled={loading || !email} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={verifyOTP} disabled={loading || otp.length !== 6} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button onClick={() => setOtpSent(false)} className="w-full text-sm text-gray-600 hover:text-gray-900 transition">Change email</button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const AdminLoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Admin Portal</h1>
          <p className="text-gray-600">Sign in to access the admin dashboard</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="space-y-4">
            <button onClick={() => setAuthMode('google')} className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-3">
              <LogIn className="w-5 h-5" />
              <span className="font-medium">Sign in with Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {!otpSent ? (
              <>
                <input
                  type="email"
                  placeholder="Admin email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
                <button 
                  onClick={sendOTP} 
                  disabled={loading || !email} 
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:outline-none focus:border-purple-500"
                />
                <button 
                  onClick={verifyOTP} 
                  disabled={loading || otp.length !== 6} 
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <button onClick={() => { setOtpSent(false); setOtp(''); }} className="w-full text-sm text-gray-600 hover:text-gray-900 transition">
                  Change email
                </button>
              </>
            )}
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-sm text-purple-900 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Admin access required. Contact support if you need access.</span>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => setPage('home')} className="text-gray-600 hover:text-gray-900 transition">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  const HomePage = () => (
    <div>
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Stop Overpaying on <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Bills</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Upload any bill. Our AI analyzes it in seconds and shows you exactly where you're being overcharged and how to save.</p>
          </div>

          {user ? (
            <div className="max-w-2xl mx-auto">
              {analyzing ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-xl border-2 border-gray-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Analyzing your bill...</h3>
                  <p className="text-gray-600">This takes 10-20 seconds</p>
                  <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              ) : (
                <label className="block bg-white rounded-2xl p-12 text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 hover:shadow-2xl transition-all shadow-xl">
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files[0] && analyzeBill(e.target.files[0])} />
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Drop your bill here</h3>
                  <p className="text-lg text-gray-600 mb-3">or click to browse</p>
                  <p className="text-sm text-gray-500">Supports PDF, JPG, PNG • Max 10MB</p>
                </label>
              )}
            </div>
          ) : (
            <div className="text-center">
              <button onClick={() => setShowAuth(true)} className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
                Get Started Free
              </button>
              <p className="text-sm text-gray-500 mt-4">No credit card required</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to start saving money</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">1. Upload</h3>
              <p className="text-gray-600">Simply upload your bill - cable, phone, internet, insurance, anything!</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">2. Analyze</h3>
              <p className="text-gray-600">Our AI scans every line item and compares it to industry standards</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">3. Save</h3>
              <p className="text-gray-600">Get actionable steps to reduce your bills and keep more money</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose NoBillShit?</h2>
            <p className="text-xl text-gray-600">The smartest way to analyze and reduce your bills</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: CheckCircle, color: 'text-green-600', title: 'AI-Powered Analysis', desc: 'Advanced AI scans every detail to find hidden charges and savings' },
              { icon: TrendingUp, color: 'text-blue-600', title: 'Instant Results', desc: 'Get your analysis in seconds, not hours or days' },
              { icon: Shield, color: 'text-purple-600', title: '100% Secure', desc: 'Your data is encrypted and never shared with third parties' },
              { icon: FileText, color: 'text-orange-600', title: 'All Bill Types', desc: 'Works with cable, phone, internet, insurance, utilities, and more' },
              { icon: Users, color: 'text-pink-600', title: 'Trusted by Thousands', desc: 'Join thousands saving money on their bills every month' },
              { icon: DollarSign, color: 'text-green-600', title: 'Average $500/Year Saved', desc: 'Our users save an average of $500 per year on bills' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
                <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Stop Overpaying?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands who are saving money every month</p>
          <button onClick={() => setShowAuth(true)} className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-xl">
            Get Started Free
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );

  const ResultsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Success Badge */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full mb-6 shadow-2xl">
            <CheckCircle className="w-6 h-6 animate-bounce" />
            <span className="font-bold text-lg">Analysis Complete!</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{analysis.fileName}</h1>
          <p className="text-purple-200">Powered by Advanced AI</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Total Amount</p>
                <p className="text-5xl font-bold">${analysis.totalAmount}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-400 opacity-75">
              <p className="text-sm">Bill Analysis Complete</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 via-pink-600 to-red-700 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-12 h-12 opacity-80 animate-pulse" />
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Issues Found</p>
                <p className="text-5xl font-bold">{analysis.issuesCount}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-400 opacity-75">
              <p className="text-sm">Potential Problems Detected</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">You Can Save</p>
                <p className="text-5xl font-bold">${analysis.potentialSavings}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-400 opacity-75">
              <p className="text-sm">Per Month Savings</p>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Analysis Summary</h2>
              <p className="text-purple-200 text-sm">Generated by Advanced AI</p>
            </div>
          </div>
          <p className="text-lg text-white leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Issues */}
        {analysis.potentialIssues?.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              Issues Detected
            </h2>
            <div className="space-y-4">
              {analysis.potentialIssues.map((issue, i) => (
                <div key={i} className={`p-6 rounded-2xl border-2 backdrop-blur transition-all hover:scale-102 ${
                  issue.severity === 'high' ? 'bg-red-500/20 border-red-400' : 
                  issue.severity === 'medium' ? 'bg-yellow-500/20 border-yellow-400' : 
                  'bg-blue-500/20 border-blue-400'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      issue.severity === 'high' ? 'bg-red-500' : 
                      issue.severity === 'medium' ? 'bg-yellow-500' : 
                      'bg-blue-500'
                    }`}>
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-white mb-2">{issue.title}</h3>
                      <p className="text-gray-200">{issue.description}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                      issue.severity === 'high' ? 'bg-red-500 text-white' : 
                      issue.severity === 'medium' ? 'bg-yellow-500 text-white' : 
                      'bg-blue-500 text-white'
                    }`}>
                      {issue.severity?.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Savings */}
        {analysis.savingsOpportunities?.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              Savings Opportunities
            </h2>
            <div className="space-y-4">
              {analysis.savingsOpportunities.map((opp, i) => (
                <div key={i} className="p-6 bg-green-500/20 backdrop-blur rounded-2xl border-2 border-green-400 flex justify-between items-start hover:bg-green-500/30 transition">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-white mb-2">{opp.title}</h3>
                    <p className="text-gray-200">{opp.description}</p>
                  </div>
                  <div className="text-right ml-6 bg-white/20 backdrop-blur rounded-2xl p-4 shadow-lg">
                    <p className="text-4xl font-bold text-green-300">${opp.savings}</p>
                    <p className="text-sm text-gray-300 mt-1">per month</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => setPage('home')} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3">
            <Upload className="w-5 h-5" />
            Analyze Another Bill
          </button>
          <button onClick={() => setPage('dashboard')} className="px-8 py-4 bg-white/20 backdrop-blur border-2 border-white/30 text-white rounded-2xl font-bold hover:bg-white/30 transition-all flex items-center gap-3">
            <BarChart3 className="w-5 h-5" />
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardPage = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Reports</h1>
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
            <p className="text-gray-600 mb-6">Upload your first bill to get started</p>
            <button onClick={() => setPage('home')} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">Analyze First Bill</button>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div key={report._id} className="bg-white rounded-2xl p-6 flex items-start justify-between shadow-sm hover:shadow-md transition">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{report.fileName}</h3>
                  <p className="text-sm text-gray-500 mb-4">{new Date(report.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-4 text-sm">
                    <span><strong>${report.totalAmount}</strong> Total</span>
                    <span><strong>{report.issuesCount}</strong> Issues</span>
                    <span className="text-green-600"><strong>${report.potentialSavings}</strong> Savings</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setAnalysis(report.analysis); setPage('results'); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteReport(report._id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const AdminPage = () => {
    const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage users and platform settings</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
              <Users className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-4xl font-bold">{stats.totalUsers || 0}</p>
              <p className="text-sm opacity-90">Total Users</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-2xl p-6 shadow-lg">
              <Crown className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-4xl font-bold">{stats.premiumUsers || 0}</p>
              <p className="text-sm opacity-90">Premium Users</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-lg">
              <Lock className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-4xl font-bold">{stats.blockedUsers || 0}</p>
              <p className="text-sm opacity-90">Blocked Users</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
              <BarChart3 className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-4xl font-bold">{stats.totalAnalyses || 0}</p>
              <p className="text-sm opacity-90">Total Analyses</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-lg"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Plan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{u.name}</p>
                            {u.role === 'admin' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{u.email}</p>
                        <p className="text-xs text-gray-500">{u.analysisCount || 0} analyses</p>
                      </td>
                      <td className="px-6 py-4">
                        {u.isPremium ? (
                          <span className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full text-sm font-semibold shadow-sm">
                            <Crown className="w-4 h-4" />
                            {u.premiumPlan || 'Premium'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                            Free Plan
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold ${
                          u.status === 'active' ? 'bg-green-100 text-green-700' : 
                          u.status === 'blocked' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => setEditingUser(u)} 
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                            title="Edit User"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => updateUser(u._id, { status: u.status === 'blocked' ? 'active' : 'blocked' })} 
                            className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition"
                            title={u.status === 'blocked' ? 'Unblock User' : 'Block User'}
                          >
                            <Lock className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => deleteUser(u._id)} 
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Settings className="w-8 h-8 text-purple-600" />
                Edit User
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Name</label>
                  <input 
                    type="text" 
                    defaultValue={editingUser.name} 
                    onChange={(e) => editingUser.name = e.target.value} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                  <input 
                    type="email" 
                    defaultValue={editingUser.email} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Plan</label>
                  <select 
                    defaultValue={editingUser.isPremium ? editingUser.premiumPlan : 'free'} 
                    onChange={(e) => { 
                      editingUser.premiumPlan = e.target.value === 'free' ? null : e.target.value; 
                      editingUser.isPremium = e.target.value !== 'free'; 
                    }} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="free">Free Plan</option>
                    <option value="monthly">Monthly Premium</option>
                    <option value="lifetime">Lifetime Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Role</label>
                  <select 
                    defaultValue={editingUser.role} 
                    onChange={(e) => editingUser.role = e.target.value} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Status</label>
                  <select 
                    defaultValue={editingUser.status} 
                    onChange={(e) => editingUser.status = e.target.value} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setEditingUser(null)} 
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => updateUser(editingUser._id, editingUser)} 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex flex-col bg-white">
        {page !== 'admin-login' && <Header />}
        <main className="flex-1">
          {page === 'home' && <HomePage />}
          {page === 'results' && analysis && <ResultsPage />}
          {page === 'dashboard' && <DashboardPage />}
          {page === 'admin' && user?.role === 'admin' && <AdminPage />}
          {page === 'admin-login' && <AdminLoginPage />}
        </main>
        {showAuth && <AuthModal />}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;