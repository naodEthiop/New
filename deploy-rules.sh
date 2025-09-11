#!/bin/bash

# Deploy Firestore Security Rules
echo "🔥 Deploying Firestore Security Rules..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Deploy the rules
echo "📤 Uploading security rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
    echo ""
    echo "🎉 The daily bonus system should now work properly."
    echo "📝 If you still see permission errors, try refreshing the page."
else
    echo "❌ Failed to deploy Firestore rules."
    echo "🔧 Please check your Firebase configuration and try again."
    exit 1
fi 