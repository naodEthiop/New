@echo off
echo 🚀 Preparing Bingo Project for Render Deployment
echo ================================================

echo.
echo 📋 Checking project structure...

REM Check if we're in the project root
if not exist "package.json" (
    echo [ERROR] Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check backend files
if not exist "backend\app.py" (
    echo [ERROR] Backend app.py not found!
    pause
    exit /b 1
)

if not exist "backend\requirements.txt" (
    echo [ERROR] Backend requirements.txt not found!
    pause
    exit /b 1
)

echo [SUCCESS] Project structure looks good!

echo.
echo 📁 Backend files found:
dir backend\*.py
dir backend\requirements.txt

echo.
echo 🔧 Environment Variables needed for Render:
echo.
echo ENVIRONMENT=production
echo FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountkey.json
echo CHAPA_SECRET_KEY=your_chapa_secret_key
echo CHAPA_BASE_URL=https://api.chapa.co/v1
echo TELEGRAM_BOT_TOKEN=your_telegram_bot_token
echo FRONTEND_URL=https://your-frontend-url.web.app
echo FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
echo CORS_ORIGINS=https://your-frontend-url.web.app
echo CALLBACK_BASE_URL=https://your-service-name.onrender.com/api/payment-callback
echo.

echo 📋 Render Deployment Settings:
echo.
echo Build Command: pip install -r requirements.txt
echo Start Command: gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
echo Root Directory: project/backend
echo.

echo 🎯 Next Steps:
echo 1. Go to https://render.com
echo 2. Create new Web Service
echo 3. Connect your GitHub repository
echo 4. Set Root Directory to: project/backend
echo 5. Add the environment variables above
echo 6. Upload serviceAccountkey.json
echo 7. Deploy!
echo.

echo 📚 Check RENDER_WEB_DEPLOYMENT.md for detailed instructions
echo.

pause 