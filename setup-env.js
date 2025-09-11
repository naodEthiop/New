#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Firebase Environment Setup\n');

const envPath = path.join(__dirname, '.env');

// Check if .env exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
} else {
  console.log('❌ .env file not found - creating template...');
  
  const envTemplate = `# Firebase Configuration
# Get these values from: https://console.firebase.google.com/
# Go to Project Settings → General → Your apps → Web app

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Telegram Bot Configuration
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Backend API Configuration
VITE_BACKEND_URL=http://localhost:5000
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env template');
}

console.log('\n📋 Next Steps:');
console.log('1. Open the .env file in your project root');
console.log('2. Replace the placeholder values with your actual Firebase config');
console.log('3. Get your config from: https://console.firebase.google.com/');
console.log('4. Go to Project Settings → General → Your apps → Web app');
console.log('5. Copy the config values and paste them in .env');

console.log('\n🌐 Domain Setup:');
console.log('1. Go to Firebase Console → Authentication → Settings');
console.log('2. Add these domains to "Authorized domains":');
console.log('   - localhost');
console.log('   - 127.0.0.1');
console.log('   - your_project_id.firebaseapp.com');
console.log('   - your_project_id.web.app');

console.log('\n🔍 To debug:');
console.log('1. Start your dev server: npm run dev');
console.log('2. Look for the debug info box in the bottom-right corner');
console.log('3. Check the console for detailed Firebase config info');

console.log('\n✅ After setup:');
console.log('- Restart your dev server');
console.log('- Clear browser cache');
console.log('- Try Google sign-in again');

console.log('\n📚 For more help, see: FIREBASE_QUICK_FIX.md'); 