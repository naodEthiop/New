#!/bin/bash

# 🚀 Bingo Project Deployment Script
# This script helps automate the deployment process

set -e  # Exit on any error

echo "🎮 Bingo Project Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Phase 1: Frontend Deployment
print_status "Phase 1: Frontend Deployment"
echo "--------------------------------"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Please create it with your environment variables."
    echo "Required variables:"
    echo "  VITE_FIREBASE_API_KEY"
    echo "  VITE_FIREBASE_AUTH_DOMAIN"
    echo "  VITE_FIREBASE_PROJECT_ID"
    echo "  VITE_FIREBASE_STORAGE_BUCKET"
    echo "  VITE_FIREBASE_MESSAGING_SENDER_ID"
    echo "  VITE_FIREBASE_APP_ID"
    echo "  VITE_BACKEND_URL"
    echo "  VITE_CHAPA_PUBLIC_KEY"
    read -p "Press Enter to continue after creating .env file..."
fi

# Install dependencies
print_status "Installing frontend dependencies..."
npm install

# Build the project
print_status "Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    print_error "Build failed! Please check for errors above."
    exit 1
fi

print_success "Frontend build completed!"

# Deploy to Firebase
print_status "Deploying to Firebase Hosting..."
firebase deploy --only hosting

print_success "Frontend deployed to Firebase!"

# Phase 2: Backend Preparation
print_status "Phase 2: Backend Preparation"
echo "---------------------------------"

cd backend

# Rename files if needed
if [ -f "requirements_new.txt" ]; then
    print_status "Renaming requirements file..."
    mv requirements_new.txt requirements.txt
fi

if [ -f "app_new.py" ]; then
    print_status "Renaming main app file..."
    mv app_new.py app.py
fi

# Test backend imports
print_status "Testing backend imports..."
python -c "from app import app; print('Backend imports OK')"

print_success "Backend preparation completed!"

# Phase 3: Environment Variables Check
print_status "Phase 3: Environment Variables Check"
echo "------------------------------------------"

echo "Please ensure these environment variables are set in your deployment platform:"
echo ""
echo "Backend Environment Variables:"
echo "  FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountkey.json"
echo "  FIREBASE_DATABASE_URL=https://your-project.firebaseio.com"
echo "  CHAPA_SECRET_KEY=your_chapa_secret_key"
echo "  CHAPA_BASE_URL=https://api.chapa.co/v1"
echo "  TELEGRAM_BOT_TOKEN=your_telegram_bot_token"
echo "  ENVIRONMENT=production"
echo "  FRONTEND_URL=https://your-frontend-url.web.app"
echo "  CALLBACK_BASE_URL=https://your-backend-url.onrender.com/api/payment-callback"
echo "  CORS_ORIGINS=https://your-frontend-url.web.app"
echo ""

# Phase 4: Payment Setup
print_status "Phase 4: Payment Setup"
echo "---------------------------"

echo "Payment setup steps:"
echo "1. Configure Chapa webhook: https://your-backend-url.onrender.com/api/payment-callback"
echo "2. Set Telegram webhook: https://your-backend-url.onrender.com/api/telegram/webhook"
echo "3. Run webhook setup script: python setup_telegram_webhook.py"
echo ""

# Phase 5: Final Instructions
print_status "Phase 5: Final Instructions"
echo "--------------------------------"

echo "Next steps:"
echo "1. Deploy backend to Render/Heroku"
echo "2. Upload serviceAccountkey.json to your backend platform"
echo "3. Set all environment variables"
echo "4. Test all endpoints"
echo "5. Configure payment webhooks"
echo ""

print_success "Deployment script completed!"
echo ""
echo "📋 Check DEPLOYMENT_GUIDE.md for detailed instructions"
echo "🎮 Happy Gaming!" 