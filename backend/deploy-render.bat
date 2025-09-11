@echo off
echo 🚀 Deploying Bingo Backend to Render...
echo ======================================

REM Check if we're in the backend directory
if not exist "app.py" (
    echo [ERROR] Please run this script from the backend directory
    pause
    exit /b 1
)

REM Check if logged in
echo [INFO] Checking Render login status...
npx render whoami >nul 2>&1
if errorlevel 1 (
    echo [INFO] Please log in to Render...
    npx render login
)

REM Get service name
set /p SERVICE_NAME="Enter your Render service name (or press Enter for 'bingo-backend'): "
if "%SERVICE_NAME%"=="" set SERVICE_NAME=bingo-backend

echo [INFO] Using service name: %SERVICE_NAME%

REM Check if service exists
npx render services list | findstr "%SERVICE_NAME%" >nul
if errorlevel 1 (
    echo [INFO] Creating new service '%SERVICE_NAME%'...
    npx render new web-service --name "%SERVICE_NAME%" --env python --build-command "pip install -r requirements.txt" --start-command "gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120"
) else (
    echo [INFO] Service '%SERVICE_NAME%' found. Updating...
)

REM Get service ID
for /f "tokens=1" %%i in ('npx render services list ^| findstr "%SERVICE_NAME%"') do set SERVICE_ID=%%i

echo [SUCCESS] Service ID: %SERVICE_ID%

REM Set environment variables
echo [INFO] Setting environment variables...

REM Get values from user
set /p CHAPA_SECRET_KEY="Enter your Chapa Secret Key: "
set /p TELEGRAM_BOT_TOKEN="Enter your Telegram Bot Token: "
set /p FRONTEND_URL="Enter your Frontend URL (e.g., https://your-app.web.app): "
set /p FIREBASE_DATABASE_URL="Enter your Firebase Database URL: "

REM Set environment variables
npx render env set ENVIRONMENT production --service "%SERVICE_ID%"
npx render env set FIREBASE_SERVICE_ACCOUNT_PATH ./serviceAccountkey.json --service "%SERVICE_ID%"
npx render env set CHAPA_SECRET_KEY "%CHAPA_SECRET_KEY%" --service "%SERVICE_ID%"
npx render env set CHAPA_BASE_URL https://api.chapa.co/v1 --service "%SERVICE_ID%"
npx render env set TELEGRAM_BOT_TOKEN "%TELEGRAM_BOT_TOKEN%" --service "%SERVICE_ID%"
npx render env set FRONTEND_URL "%FRONTEND_URL%" --service "%SERVICE_ID%"
npx render env set FIREBASE_DATABASE_URL "%FIREBASE_DATABASE_URL%" --service "%SERVICE_ID%"

REM Set callback URL after service is deployed
set CALLBACK_URL=https://%SERVICE_NAME%.onrender.com/api/payment-callback
npx render env set CALLBACK_BASE_URL "%CALLBACK_URL%" --service "%SERVICE_ID%"
npx render env set CORS_ORIGINS "%FRONTEND_URL%" --service "%SERVICE_ID%"

echo [SUCCESS] Environment variables set!

REM Upload service account key if it exists
if exist "serviceAccountkey.json" (
    echo [INFO] Uploading service account key...
    npx render file upload serviceAccountkey.json ./serviceAccountkey.json --service "%SERVICE_ID%"
    echo [SUCCESS] Service account key uploaded!
) else (
    echo [WARNING] serviceAccountkey.json not found. Please upload it manually after deployment.
)

REM Deploy the service
echo [INFO] Deploying service...
npx render deploy --service "%SERVICE_ID%"

echo [SUCCESS] Deployment completed!
echo.
echo 🎉 Your backend is now deployed at:
echo    https://%SERVICE_NAME%.onrender.com
echo.
echo 📋 Next steps:
echo    1. Test the health endpoint: https://%SERVICE_NAME%.onrender.com/health
echo    2. Configure Chapa webhook: %CALLBACK_URL%
echo    3. Configure Telegram webhook: https://%SERVICE_NAME%.onrender.com/api/telegram/webhook
echo    4. Update your frontend .env file with the new backend URL
echo.
echo 🔍 To view logs:
echo    npx render logs --service %SERVICE_ID%
echo.
echo 🎮 Happy Gaming!

pause 