#!/usr/bin/env node

/**
 * Firebase Configuration Verification Script
 * Run this to check if your Firebase setup is correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Configuration Verification\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('Please create a .env file with your Firebase configuration.');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Check required Firebase variables
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

console.log('📋 Checking Environment Variables:');
let allVarsPresent = true;

requiredVars.forEach(varName => {
  if (envVars[varName]) {
    console.log(`✅ ${varName}: ${envVars[varName].substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    allVarsPresent = false;
  }
});

console.log('\n🌐 Current Domain Information:');
console.log(`Current URL: ${process.env.URL || 'localhost'}`);
console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`);

console.log('\n📝 Next Steps:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select your project');
console.log('3. Go to Authentication → Settings');
console.log('4. Add these domains to "Authorized domains":');
console.log('   - localhost');
console.log('   - 127.0.0.1');
console.log('   - bingo-game-39ba5.web.app');
console.log('   - Your custom domain (if any)');

console.log('\n5. Go to Authentication → Sign-in method');
console.log('6. Enable Google provider');
console.log('7. Add the same domains to Google provider');

console.log('\n🔧 Quick Fix Commands:');
console.log('npm run dev          # Start development server');
console.log('firebase login       # Login to Firebase CLI');
console.log('firebase init hosting # Initialize Firebase hosting');

if (!allVarsPresent) {
  console.log('\n❌ Some environment variables are missing!');
  console.log('Please check your .env file and add the missing variables.');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables are present!');
  console.log('The issue is likely with Firebase Console configuration.');
}

console.log('\n📚 For more help, see: FIREBASE_SETUP_GUIDE.md'); 