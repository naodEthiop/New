# 🚀 Complete Bingo Project Deployment Guide

## 📋 Project Overview

Your Bingo project consists of:
- **Frontend**: React + TypeScript + Vite (Firebase Hosting)
- **Backend**: Flask + Python (Render/Heroku)
- **Database**: Firebase Firestore
- **Payments**: Chapa + Telegram Payments
- **Authentication**: Firebase Auth

---

## 🎯 Pre-Deployment Checklist

### ✅ Frontend (React App)
- [ ] All TypeScript errors fixed
- [ ] Environment variables config ured
- [ ] Firebase config updated
- [ ] Build process working
- [ ] All dependencies installed

### ✅ Backend (Flask API)
- [ ] Import issues resolved ✅
- [ ] Modular structure implemented ✅
- [ ] Environment variables ready
- [ ] Requirements file updated
- [ ] Gunicorn configured for production

### ✅ Firebase Setup
- [ ] Project created
- [ ] Firestore database configured
- [ ] Authentication enabled
- [ ] Hosting configured
- [ ] Security rules set

### ✅ Payment Integration
- [ ] Chapa account configured
- [ ] Telegram bot created
- [ ] Webhook URLs ready
- [ ] Payment testing completed

---

## 🚀 Step-by-Step Deployment

### Phase 1: Firebase Setup

#### 1.1 Firebase Project Configuration
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
cd project
firebase init
```

#### 1.2 Environment Variables for Frontend
Create `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_URL=https://your-backend-url.onrender.com
VITE_CHAPA_PUBLIC_KEY=your_chapa_public_key
```

#### 1.3 Deploy Frontend to Firebase Hosting
```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Phase 2: Backend Deployment (Render)

#### 2.1 Prepare Backend Files
```bash
cd project/backend

# Rename requirements file
mv requirements_new.txt requirements.txt

# Rename main app file
mv app_new.py app.py
```

#### 2.2 Create Render Configuration
Create `render.yaml` in the backend directory:
```yaml
services:
  - type: web
    name: bingo-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: FIREBASE_SERVICE_ACCOUNT_PATH
        value: ./serviceAccountkey.json
      - key: CHAPA_SECRET_KEY
        sync: false
      - key: TELEGRAM_BOT_TOKEN
        sync: false
      - key: FRONTEND_URL
        value: https://your-frontend-url.web.app
      - key: CALLBACK_BASE_URL
        value: https://your-backend-url.onrender.com/api/payment-callback
      - key: CORS_ORIGINS
        value: https://your-frontend-url.web.app
```

#### 2.3 Environment Variables for Backend
Set these in Render dashboard:
```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountkey.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Chapa Configuration
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_BASE_URL=https://api.chapa.co/v1

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Application Configuration
ENVIRONMENT=production
FRONTEND_URL=https://your-frontend-url.web.app
CALLBACK_BASE_URL=https://your-backend-url.onrender.com/api/payment-callback
CORS_ORIGINS=https://your-frontend-url.web.app
```

#### 2.4 Upload Service Account Key
1. Go to Render dashboard
2. Navigate to your service
3. Go to "Files" tab
4. Upload `serviceAccountkey.json`

#### 2.5 Deploy Backend
```bash
# Push to GitHub (if using Git deployment)
git add .
git commit -m "Deploy backend to Render"
git push origin main

# Or use Render CLI
render deploy
```

### Phase 3: Payment Integration

#### 3.1 Chapa Configuration
1. Log into Chapa dashboard
2. Set webhook URL: `https://your-backend-url.onrender.com/api/payment-callback`
3. Copy your secret key to backend environment variables

#### 3.2 Telegram Bot Setup
1. Use BotFather to set payment provider
2. Set webhook URL: `https://your-backend-url.onrender.com/api/telegram/webhook`
3. Run webhook setup script:
```bash
cd project/backend
python setup_telegram_webhook.py
```

### Phase 4: Testing & Verification

#### 4.1 Test Backend Endpoints
```bash
# Health check
curl https://your-backend-url.onrender.com/health

# Test API
curl https://your-backend-url.onrender.com/api/test
```

#### 4.2 Test Frontend
1. Visit your Firebase hosting URL
2. Test user registration/login
3. Test payment flows
4. Test Telegram bot commands

#### 4.3 Test Payment Flows
1. **Chapa Payment**: Test deposit through web interface
2. **Telegram Payment**: Test bot commands and payments
3. **Webhook Verification**: Check payment callbacks

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Frontend Issues
```bash
# Build errors
npm run build

# TypeScript errors
npx tsc --noEmit

# Missing dependencies
npm install
```

#### Backend Issues
```bash
# Import errors (fixed ✅)
python -c "from app import app; print('OK')"

# Environment variables
echo $ENVIRONMENT

# Firebase connection
python -c "from database.firebase import firebase_manager; print('Firebase OK')"
```

#### Payment Issues
1. **Webhook not receiving**: Check URL and SSL
2. **Payment failures**: Verify API keys
3. **Telegram bot not responding**: Check bot token and webhook

---

## 📊 Monitoring & Maintenance

### Health Checks
- Backend: `/health` endpoint
- Frontend: Firebase hosting status
- Database: Firebase console
- Payments: Chapa dashboard

### Logs
- Backend: Render logs
- Frontend: Firebase hosting logs
- Database: Firebase console logs

### Updates
```bash
# Frontend updates
npm run build
firebase deploy --only hosting

# Backend updates
git push origin main  # Auto-deploys on Render
```

---

## 🎉 Deployment Complete!

Your Bingo project is now fully deployed with:
- ✅ Frontend on Firebase Hosting
- ✅ Backend on Render
- ✅ Database on Firebase Firestore
- ✅ Payments via Chapa & Telegram
- ✅ Authentication via Firebase Auth

### Final URLs
- **Frontend**: `https://your-project.web.app`
- **Backend**: `https://your-backend-url.onrender.com`
- **Telegram Bot**: `@your_bot_username`

### Next Steps
1. Monitor application performance
2. Set up error tracking (Sentry)
3. Configure analytics
4. Plan scaling strategy
5. Regular security updates

---

## 📞 Support

If you encounter issues:
1. Check logs in respective platforms
2. Verify environment variables
3. Test endpoints individually
4. Review this deployment guide
5. Check Firebase console for errors

**Happy Gaming! 🎮** 