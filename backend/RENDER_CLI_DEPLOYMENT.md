# 🚀 Render CLI Deployment Guide

## 📋 Prerequisites

### 1. Install Render CLI
```bash
# Install Render CLI globally
npm install -g @render/cli

# Or using curl (Linux/Mac)
curl -s https://render.com/download-cli/linux | bash

# For Windows (using PowerShell)
iwr https://render.com/download-cli/windows -OutFile render.exe
```

### 2. Login to Render
```bash
render login
```

---

## 🎯 Step-by-Step CLI Deployment

### Step 1: Initialize Render Service
```bash
cd project/backend

# Create a new web service
render new web-service

# Follow the prompts:
# - Name: bingo-backend
# - Environment: Python
# - Build Command: pip install -r requirements.txt
# - Start Command: gunicorn app:app --bind 0.00.0.0:$PORT --workers 2 --timeout 120
# - Plan: Free (or your preferred plan)
```

### Step 2: Configure Environment Variables
```bash
# Set environment variables via CLI
render env set ENVIRONMENT production
render env set FIREBASE_SERVICE_ACCOUNT_PATH ./serviceAccountkey.json
render env set CHAPA_SECRET_KEY your_chapa_secret_key
render env set CHAPA_BASE_URL https://api.chapa.co/v1
render env set TELEGRAM_BOT_TOKEN your_telegram_bot_token
render env set FRONTEND_URL https://your-frontend-url.web.app
render env set CALLBACK_BASE_URL https://your-backend-url.onrender.com/api/payment-callback
render env set CORS_ORIGINS https://your-frontend-url.web.app

# Set Firebase database URL
render env set FIREBASE_DATABASE_URL https://your-project.firebaseio.com
```

### Step 3: Upload Service Account Key
```bash
# Upload the Firebase service account key
render file upload serviceAccountkey.json ./serviceAccountkey.json
```

### Step 4: Deploy the Service
```bash
# Deploy your service
render deploy

# Or deploy with specific service ID
render deploy --service-id your-service-id
```

---

## 🔧 Alternative: Using render.yaml

### Create render.yaml Configuration
```bash
# Create render.yaml in backend directory
cat > render.yaml << 'EOF'
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
EOF
```

### Deploy with render.yaml
```bash
# Deploy using the configuration file
render deploy --config render.yaml
```

---

## 📊 CLI Commands Reference

### Service Management
```bash
# List all services
render services list

# Get service details
render services show your-service-id

# View service logs
render logs --service your-service-id

# View real-time logs
render logs --service your-service-id --follow
```

### Environment Variables
```bash
# List environment variables
render env list --service your-service-id

# Set environment variable
render env set KEY value --service your-service-id

# Get environment variable
render env get KEY --service your-service-id

# Delete environment variable
render env unset KEY --service your-service-id
```

### File Management
```bash
# List files
render files list --service your-service-id

# Upload file
render file upload filename.txt ./path/to/file --service your-service-id

# Download file
render file download filename.txt --service your-service-id

# Delete file
render file delete filename.txt --service your-service-id
```

### Deployment
```bash
# Deploy service
render deploy --service your-service-id

# Deploy with config file
render deploy --config render.yaml

# Cancel deployment
render deploy cancel --service your-service-id
```

---

## 🚀 Quick Deployment Script

### Create deploy-render.sh
```bash
#!/bin/bash

echo "🚀 Deploying Bingo Backend to Render..."

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI not found. Installing..."
    npm install -g @render/cli
fi

# Login to Render
echo "🔐 Logging into Render..."
render login

# Set environment variables
echo "⚙️ Setting environment variables..."
render env set ENVIRONMENT production
render env set FIREBASE_SERVICE_ACCOUNT_PATH ./serviceAccountkey.json
render env set CHAPA_SECRET_KEY $CHAPA_SECRET_KEY
render env set TELEGRAM_BOT_TOKEN $TELEGRAM_BOT_TOKEN
render env set FRONTEND_URL $FRONTEND_URL
render env set CALLBACK_BASE_URL $CALLBACK_BASE_URL
render env set CORS_ORIGINS $CORS_ORIGINS

# Upload service account key
echo "📁 Uploading service account key..."
render file upload serviceAccountkey.json ./serviceAccountkey.json

# Deploy
echo "🚀 Deploying service..."
render deploy

echo "✅ Deployment completed!"
```

### Make it executable and run
```bash
chmod +x deploy-render.sh
./deploy-render.sh
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Service Not Found
```bash
# Check if service exists
render services list
https://core.telegram.org/bots/webapps
# Create service if it doesn't exist
render new web-service
```

#### 2. Environment Variables Not Set
```bash
# List current environment variables
render env list --service your-service-id

# Set missing variables
render env set KEY value --service your-service-id
```

#### 3. Build Failures
```bash
# Check build logs
render logs --service your-service-id

# Verify requirements.txt exists
ls -la requirements.txt
```

#### 4. Service Account Key Issues
```bash
# Check if file exists
render files list --service your-service-id

# Re-upload if needed
render file upload serviceAccountkey.json ./serviceAccountkey.json
```

---

## 📋 Deployment Checklist

- [ ] Render CLI installed and logged in
- [ ] All environment variables set
- [ ] Service account key uploaded
- [ ] requirements.txt present
- [ ] app.py is the main file
- [ ] Service deployed successfully
- [ ] Health check endpoint working
- [ ] Payment webhooks configured

---

## 🎉 Success!

After deployment, your backend will be available at:
`https://your-service-name.onrender.com`

Test the deployment:
```bash
# Health check
curl https://your-service-name.onrender.com/health

# Test API
curl https://your-service-name.onrender.com/api/test
```

**Happy Deploying! 🚀** 