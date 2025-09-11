#!/bin/bash

# 🚀 Quick Render CLI Deployment Script for Bingo Backend

set -e  # Exit on any error

echo "🎮 Bingo Backend - Render CLI Deployment"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if we're in the backend directory
if [ ! -f "app.py" ]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    print_warning "Render CLI not found. Installing..."
    npm install -g @render/cli
fi

# Check if logged in
print_status "Checking Render login status..."
if ! render whoami &> /dev/null; then
    print_status "Please log in to Render..."
    render login
fi

# Get service name
read -p "Enter your Render service name (or press Enter for 'bingo-backend'): " SERVICE_NAME
SERVICE_NAME=${SERVICE_NAME:-bingo-backend}

print_status "Using service name: $SERVICE_NAME"

# Check if service exists
if render services list | grep -q "$SERVICE_NAME"; then
    print_status "Service '$SERVICE_NAME' found. Updating..."
    SERVICE_ID=$(render services list | grep "$SERVICE_NAME" | awk '{print $1}')
else
    print_status "Creating new service '$SERVICE_NAME'..."
    render new web-service --name "$SERVICE_NAME" --env python --build-command "pip install -r requirements.txt" --start-command "gunicorn app:app --bind 0.0.0.0:\$PORT --workers 2 --timeout 120"
    SERVICE_ID=$(render services list | grep "$SERVICE_NAME" | awk '{print $1}')
fi

print_success "Service ID: $SERVICE_ID"

# Set environment variables
print_status "Setting environment variables..."

# Get values from user
read -p "Enter your Chapa Secret Key: " CHAPA_SECRET_KEY
read -p "Enter your Telegram Bot Token: " TELEGRAM_BOT_TOKEN
read -p "Enter your Frontend URL (e.g., https://your-app.web.app): " FRONTEND_URL
read -p "Enter your Firebase Database URL: " FIREBASE_DATABASE_URL

# Set environment variables
render env set ENVIRONMENT production --service "$SERVICE_ID"
render env set FIREBASE_SERVICE_ACCOUNT_PATH ./serviceAccountkey.json --service "$SERVICE_ID"
render env set CHAPA_SECRET_KEY "$CHAPA_SECRET_KEY" --service "$SERVICE_ID"
render env set CHAPA_BASE_URL https://api.chapa.co/v1 --service "$SERVICE_ID"
render env set TELEGRAM_BOT_TOKEN "$TELEGRAM_BOT_TOKEN" --service "$SERVICE_ID"
render env set FRONTEND_URL "$FRONTEND_URL" --service "$SERVICE_ID"
render env set FIREBASE_DATABASE_URL "$FIREBASE_DATABASE_URL" --service "$SERVICE_ID"

# Set callback URL after service is deployed
CALLBACK_URL="https://$SERVICE_NAME.onrender.com/api/payment-callback"
render env set CALLBACK_BASE_URL "$CALLBACK_URL" --service "$SERVICE_ID"
render env set CORS_ORIGINS "$FRONTEND_URL" --service "$SERVICE_ID"

print_success "Environment variables set!"

# Upload service account key if it exists
if [ -f "serviceAccountkey.json" ]; then
    print_status "Uploading service account key..."
    render file upload serviceAccountkey.json ./serviceAccountkey.json --service "$SERVICE_ID"
    print_success "Service account key uploaded!"
else
    print_warning "serviceAccountkey.json not found. Please upload it manually after deployment."
fi

# Deploy the service
print_status "Deploying service..."
render deploy --service "$SERVICE_ID"

print_success "Deployment completed!"
echo ""
echo "🎉 Your backend is now deployed at:"
echo "   https://$SERVICE_NAME.onrender.com"
echo ""
echo "📋 Next steps:"
echo "   1. Test the health endpoint: https://$SERVICE_NAME.onrender.com/health"
echo "   2. Configure Chapa webhook: $CALLBACK_URL"
echo "   3. Configure Telegram webhook: https://$SERVICE_NAME.onrender.com/api/telegram/webhook"
echo "   4. Update your frontend .env file with the new backend URL"
echo ""
echo "🔍 To view logs:"
echo "   render logs --service $SERVICE_ID"
echo ""
echo "🎮 Happy Gaming!" 