@echo off
REM 🚀 Bingo Project Deployment Script (Windows)
REM This script helps automate the deployment process

echo 🎮 Bingo Project Deployment Script
echo ==================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the project root directory
    pause
    exit /b 1
)

REM Phase 1: Frontend Deployment
echo [INFO] Phase 1: Frontend Deployment
echo --------------------------------

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found. Please create it with your environment variables.
    echo Required variables:
    echo   VITE_FIREBASE_API_KEY
    echo   VITE_FIREBASE_AUTH_DOMAIN
    echo   VITE_FIREBASE_PROJECT_ID
    echo   VITE_FIREBASE_STORAGE_BUCKET
    echo   VITE_FIREBASE_MESSAGING_SENDER_ID
    echo   VITE_FIREBASE_APP_ID
    echo   VITE_BACKEND_URL
    echo   VITE_CHAPA_PUBLIC_KEY
    pause
)

REM Install dependencies
echo [INFO] Installing frontend dependencies...
call npm install

REM Build the project
echo [INFO] Building frontend...
call npm run build

REM Check if build was successful
if not exist "build" (
    echo [ERROR] Build failed! Please check for errors above.
    pause
    exit /b 1
)

echo [SUCCESS] Frontend build completed!

REM Deploy to Firebase
echo [INFO] Deploying to Firebase Hosting...
call firebase deploy --only hosting

echo [SUCCESS] Frontend deployed to Firebase!

REM Phase 2: Backend Preparation
echo [INFO] Phase 2: Backend Preparation
echo ---------------------------------

cd backend

REM Rename files if needed
if exist "requirements_new.txt" (
    echo [INFO] Renaming requirements file...
    ren requirements_new.txt requirements.txt
)

if exist "app_new.py" (
    echo [INFO] Renaming main app file...
    ren app_new.py app.py
)

REM Test backend imports
echo [INFO] Testing backend imports...
python -c "from app import app; print('Backend imports OK')"

echo [SUCCESS] Backend preparation completed!

REM Phase 3: Environment Variables Check
echo [INFO] Phase 3: Environment Variables Check
echo ------------------------------------------

echo Please ensure these environment variables are set in your deployment platform:
echo.
echo Backend Environment Variables:
echo   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountkey.json
echo   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
echo   CHAPA_SECRET_KEY=your_chapa_secret_key
echo   CHAPA_BASE_URL=https://api.chapa.co/v1
echo   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
echo   ENVIRONMENT=production
echo   FRONTEND_URL=https://your-frontend-url.web.app
echo   CALLBACK_BASE_URL=https://your-backend-url.onrender.com/api/payment-callback
echo   CORS_ORIGINS=https://your-frontend-url.web.app
echo.

REM Phase 4: Payment Setup
echo [INFO] Phase 4: Payment Setup
echo ---------------------------

echo Payment setup steps:
echo 1. Configure Chapa webhook: https://your-backend-url.onrender.com/api/payment-callback
echo 2. Set Telegram webhook: https://your-backend-url.onrender.com/api/telegram/webhook
echo 3. Run webhook setup script: python setup_telegram_webhook.py
echo.

REM Phase 5: Final Instructions
echo [INFO] Phase 5: Final Instructions
echo --------------------------------

echo Next steps:
echo 1. Deploy backend to Render/Heroku
echo 2. Upload serviceAccountkey.json to your backend platform
echo 3. Set all environment variables
echo 4. Test all endpoints
echo 5. Configure payment webhooks
echo.

echo [SUCCESS] Deployment script completed!
echo.
echo 📋 Check DEPLOYMENT_GUIDE.md for detailed instructions
echo 🎮 Happy Gaming!

pause 