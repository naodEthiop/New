@echo off
echo 🔥 Deploying Firestore Security Rules...

REM Check if firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    pause
    exit /b 1
)

REM Check if user is logged in
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Firebase. Please login first:
    echo firebase login
    pause
    exit /b 1
)

REM Deploy the rules
echo 📤 Uploading security rules...
firebase deploy --only firestore:rules

if %errorlevel% equ 0 (
    echo ✅ Firestore rules deployed successfully!
    echo.
    echo 🎉 The daily bonus system should now work properly.
    echo 📝 If you still see permission errors, try refreshing the page.
) else (
    echo ❌ Failed to deploy Firestore rules.
    echo 🔧 Please check your Firebase configuration and try again.
    pause
    exit /b 1
)

pause 