# 🚀 Render CLI Usage Guide

## ✅ Render CLI is Installed and Working!

Your Render CLI version: `0.3.2`

---

## 🔐 Step 1: Login to Render

```bash
npx render login
```

This will open your browser to authenticate with Render. Follow the prompts to log in.

---

## 🎯 Step 2: Navigate to Backend Directory

```bash
cd project/backend
```

---

## 🏗️ Step 3: Create a New Web Service

```bash
npx render new web-service
```

**Follow the prompts:**
- **Name**: `bingo-backend` (or your preferred name)
- **Environment**: `python`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
- **Plan**: Choose your plan (Free tier available)

---

## ⚙️ Step 4: Set Environment Variables

After creating the service, set your environment variables:

```bash
# Get your service ID first
npx render services list

# Set environment variables (replace YOUR_SERVICE_ID with actual ID)
npx render env set ENVIRONMENT production --service YOUR_SERVICE_ID
npx render env set FIREBASE_SERVICE_ACCOUNT_PATH ./serviceAccountkey.json --service YOUR_SERVICE_ID
npx render env set CHAPA_SECRET_KEY your_chapa_secret_key --service YOUR_SERVICE_ID
npx render env set CHAPA_BASE_URL https://api.chapa.co/v1 --service YOUR_SERVICE_ID
npx render env set TELEGRAM_BOT_TOKEN your_telegram_bot_token --service YOUR_SERVICE_ID
npx render env set FRONTEND_URL https://your-frontend-url.web.app --service YOUR_SERVICE_ID
npx render env set FIREBASE_DATABASE_URL https://your-project.firebaseio.com --service YOUR_SERVICE_ID
```

---

## 📁 Step 5: Upload Service Account Key

```bash
# Upload your Firebase service account key
npx render file upload serviceAccountkey.json ./serviceAccountkey.json --service YOUR_SERVICE_ID
```

---

## 🚀 Step 6: Deploy Your Service

```bash
npx render deploy --service YOUR_SERVICE_ID
```

---

## 📊 Useful Render CLI Commands

### List Services
```bash
npx render services list
```

### View Service Details
```bash
npx render services show YOUR_SERVICE_ID
```

### View Logs
```bash
# View recent logs
npx render logs --service YOUR_SERVICE_ID

# Follow logs in real-time
npx render logs --service YOUR_SERVICE_ID --follow
```

### Environment Variables
```bash
# List all environment variables
npx render env list --service YOUR_SERVICE_ID

# Set an environment variable
npx render env set KEY value --service YOUR_SERVICE_ID

# Get a specific environment variable
npx render env get KEY --service YOUR_SERVICE_ID

# Delete an environment variable
npx render env unset KEY --service YOUR_SERVICE_ID
```

### File Management
```bash
# List files
npx render files list --service YOUR_SERVICE_ID

# Upload a file
npx render file upload filename.txt ./path/to/file --service YOUR_SERVICE_ID

# Download a file
npx render file download filename.txt --service YOUR_SERVICE_ID

# Delete a file
npx render file delete filename.txt --service YOUR_SERVICE_ID
```

### Deployment
```bash
# Deploy service
npx render deploy --service YOUR_SERVICE_ID

# Cancel deployment
npx render deploy cancel --service YOUR_SERVICE_ID
```

---

## 🎯 Quick Deployment Script

Create a file called `deploy-render.bat` in your backend directory:

```batch
@echo off
echo 🚀 Deploying Bingo Backend to Render...

REM Get service ID
for /f "tokens=1" %%i in ('npx render services list ^| findstr "bingo-backend"') do set SERVICE_ID=%%i

echo Service ID: %SERVICE_ID%

REM Set environment variables
echo Setting environment variables...
npx render env set ENVIRONMENT production --service %SERVICE_ID%
npx render env set FIREBASE_SERVICE_ACCOUNT_PATH ./serviceAccountkey.json --service %SERVICE_ID%
npx render env set CHAPA_SECRET_KEY %CHAPA_SECRET_KEY% --service %SERVICE_ID%
npx render env set TELEGRAM_BOT_TOKEN %TELEGRAM_BOT_TOKEN% --service %SERVICE_ID%
npx render env set FRONTEND_URL %FRONTEND_URL% --service %SERVICE_ID%
npx render env set FIREBASE_DATABASE_URL %FIREBASE_DATABASE_URL% --service %SERVICE_ID%

REM Upload service account key
if exist "serviceAccountkey.json" (
    echo Uploading service account key...
    npx render file upload serviceAccountkey.json ./serviceAccountkey.json --service %SERVICE_ID%
)

REM Deploy
echo Deploying service...
npx render deploy --service %SERVICE_ID%

echo ✅ Deployment completed!
pause
```

---

## 🔍 Troubleshooting

### Common Issues:

1. **Service Not Found**
   ```bash
   npx render services list
   ```

2. **Environment Variables Not Set**
   ```bash
   npx render env list --service YOUR_SERVICE_ID
   ```

3. **Build Failures**
   ```bash
   npx render logs --service YOUR_SERVICE_ID
   ```

4. **File Upload Issues**
   ```bash
   npx render files list --service YOUR_SERVICE_ID
   ```

---

## 🎉 Success!

After deployment, your backend will be available at:
`https://your-service-name.onrender.com`

Test your deployment:
```bash
# Health check
curl https://your-service-name.onrender.com/health

# Test API
curl https://your-service-name.onrender.com/api/test
```

---

## 📋 Next Steps

1. ✅ Deploy backend using Render CLI
2. 🔗 Configure payment webhooks
3. 🧪 Test all endpoints
4. 🎮 Update frontend with new backend URL
5. 🚀 Deploy frontend to Firebase

**Happy Deploying! 🚀** 