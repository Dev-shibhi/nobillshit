# GO LIVE - COMPLETE GUIDE FROM ZERO

## FILES I'VE CREATED

All files are ready. Download from Claude responses above:
1. backend/server.js
2. backend/package.json  
3. backend/.env.example
4. frontend/package.json
5. (Frontend React files - I'll provide next)

---

## STEP 1: SETUP PROJECT LOCALLY (10 min)

### A. Create folders
```bash
cd C:\projects
mkdir NoBillShit
cd NoBillShit
mkdir backend frontend
```

### B. Add backend files

1. Copy my **backend/server.js** → Your `backend/server.js`
2. Copy my **backend/package.json** → Your `backend/package.json`
3. Create `backend/.env` with your real values:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nobillshit
JWT_SECRET=nobillshit_production_secret_2024_min32chars
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com  
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_16char_app_password
OPENAI_API_KEY=sk-proj-xxxxx
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://nobillshit.com
```

### C. Install backend
```bash
cd backend
npm install
```

### D. Add frontend files

1. Copy my **frontend/package.json** → Your `frontend/package.json`
2. Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
```

3. Create frontend structure:
```bash
cd frontend
mkdir src public
```

4. I'll provide React files next...

---

## STEP 2: GET GMAIL APP PASSWORD (5 min)

1. https://myaccount.google.com/security → Enable 2FA
2. https://myaccount.google.com/apppasswords
3. Generate password for "Mail"
4. Copy 16-character code
5. Add to backend/.env as EMAIL_PASS

---

## STEP 3: PUSH TO GITHUB (5 min)

```bash
cd C:\projects\NoBillShit

# Create .gitignore
echo node_modules/ > .gitignore
echo build/ >> .gitignore
echo .env >> .gitignore

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nobillshit.git
git push -u origin main
```

---

## STEP 4: DEPLOY BACKEND (10 min)

### Render.com

1. Go to https://render.com
2. Sign in with GitHub
3. New → Web Service
4. Select `nobillshit` repo
5. Settings:
   - Name: `nobillshit-backend`
   - Root: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Free tier
6. Add all environment variables from backend/.env
7. Create Service
8. Wait 5 min
9. Copy URL: `https://nobillshit-backend.onrender.com`

---

## STEP 5: DEPLOY FRONTEND (10 min)

### Vercel.com

1. Go to https://vercel.com
2. Sign in with GitHub  
3. New Project
4. Select `nobillshit` repo
5. Settings:
   - Framework: Create React App
   - Root: `frontend`
   - Build: `npm run build`
   - Output: `build`
6. Environment Variables:
   - REACT_APP_API_URL = https://nobillshit-backend.onrender.com/api
   - REACT_APP_GOOGLE_CLIENT_ID = your_id
7. Deploy
8. Wait 5 min
9. Visit your app!

---

## STEP 6: MAKE YOURSELF ADMIN (5 min)

1. Sign up via your app
2. Go to MongoDB Atlas
3. Browse Collections → users
4. Find your email
5. Edit: Change `role: "user"` to `role: "admin"`
6. Refresh app
7. You'll see "Admin" in header

---

## DONE! 

- App: https://your-app.vercel.app
- Admin: https://your-app.vercel.app/admin
- Backend: https://your-backend.onrender.com

---

Next: I'll create all React frontend files for you.
