# 🚀 Render Web Deployment Guide

Since the Render CLI installation is problematic on Windows, here's how to deploy using the **Render Web Interface** - which is actually easier and more reliable!

---

## 🎯 Step 1: Prepare Your Backend Files

Make sure your backend is ready:

```bash
cd project/backend

# Verify your files are correct
ls -la
# You should see: app.py, requirements.txt, and all your modules
```

---

## 🌐 Step 2: Deploy via Render Web Interface

### 2.1 Go to Render Dashboard
1. Visit [render.com](https://render.com)
2. Sign up/Login to your account
3. Click **"New +"** → **"Web Service"**

### 2.2 Connect Your Repository
1. **Connect your GitHub repository** (recommended)
   - Click "Connect account" next to GitHub
   - Authorize Render to access your repos
   - Select your repository

2. **Or use "Deploy from existing repository"**
   - Choose your repository
   - Select the branch (usually `main` or `master`)

### 2.3 Configure Your Service

**Basic Settings:**
- **Name**: `bingo-backend` (or your preferred name)
- **Environment**: `Python 3`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `project/backend` (since your backend is in a subdirectory)

**Build & Deploy Settings:**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`

**Plan:**
- Choose **Free** tier for testing
- Or **Starter** ($7/month) for production

### 2.4 Set Environment Variables

Click **"Environment"** tab and add these variables:

```env
ENVIRONMENT=production
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountkey.json
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_BASE_URL=https://api.chapa.co/v1
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
FRONTEND_URL=https://your-frontend-url.web.app
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
CORS_ORIGINS=https://your-frontend-url.web.app
```

**Note**: Don't set `CALLBACK_BASE_URL` yet - we'll set it after deployment.

### 2.5 Upload Service Account Key

1. Go to **"Files"** tab
2. Click **"Upload File"**
3. Upload your `serviceAccountkey.json` file
4. Make sure it's named exactly `serviceAccountkey.json`

### 2.6 Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your service will be available at: `https://your-service-name.onrender.com`

---

## 🔧 Step 3: Post-Deployment Configuration

### 3.1 Set Callback URL
After deployment, go back to **Environment Variables** and add:
```env
CALLBACK_BASE_URL=https://your-service-name.onrender.com/api/payment-callback
```

### 3.2 Test Your Deployment
```bash
# Health check
curl https://your-service-name.onrender.com/health

# Test API
curl https://your-service-name.onrender.com/api/test
```

---

## 📊 Step 4: Configure Payment Webhooks

### 4.1 Chapa Webhook
1. Go to your Chapa dashboard
2. Set webhook URL: `https://your-service-name.onrender.com/api/payment-callback`

### 4.2 Telegram Webhook
1. Use BotFather to set payment provider
2. Set webhook URL: `https://your-service-name.onrender.com/api/telegram/webhook`
3. Or run the webhook setup script:
   ```bash
   cd project/backend
   python setup_telegram_webhook.py
   ```

---

## 🔍 Step 5: Monitor Your Service

### View Logs
1. Go to your service dashboard
2. Click **"Logs"** tab
3. View real-time logs

### Health Checks
- Your service has automatic health checks
- If it fails, Render will restart it automatically

---

## 🚀 Step 6: Update Frontend

Update your frontend `.env` file:
```env
VITE_BACKEND_URL=https://your-service-name.onrender.com
```

---

## 📋 Advantages of Web Interface

✅ **No CLI installation issues**  
✅ **Visual configuration**  
✅ **Easy environment variable management**  
✅ **Built-in file upload**  
✅ **Real-time logs**  
✅ **Automatic deployments**  
✅ **Health monitoring**  

---

## 🔧 Troubleshooting

### Build Failures
1. Check **Logs** tab for error messages
2. Verify `requirements.txt` exists and is correct
3. Make sure `app.py` is the main file

### Environment Variables
1. Go to **Environment** tab
2. Verify all variables are set correctly
3. Check for typos in variable names

### Service Account Key
1. Go to **Files** tab
2. Verify `serviceAccountkey.json` is uploaded
3. Check the file name is exactly correct

### Payment Issues
1. Verify webhook URLs are correct
2. Check logs for payment callback errors
3. Test webhook endpoints manually

---

## 🎉 Success!

Your backend is now deployed and ready! 

**Next steps:**
1. ✅ Backend deployed to Render
2. 🔗 Configure payment webhooks
3. 🧪 Test all endpoints
4. 🎮 Deploy frontend to Firebase
5. 🚀 Your Bingo app is live!

**Happy Deploying! 🚀** 