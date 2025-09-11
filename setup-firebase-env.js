const fs = require('fs');
const path = require('path');

const envContent = `# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCUL6n2RVoKE_lIdnMJFadACTwSYHNMHaU
VITE_FIREBASE_AUTH_DOMAIN=bingo-game-39ba5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bingo-game-39ba5
VITE_FIREBASE_STORAGE_BUCKET=bingo-game-39ba5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=817224600440
VITE_FIREBASE_APP_ID=1:817224600440:web:55fe03f641a710e5cf168d

# Telegram Bot Configuration
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
VITE_TELEGRAM_BOT_USERNAME=your_telegram_bot_username_here

# App Configuration
VITE_APP_NAME=Bingo Game
VITE_APP_VERSION=1.0.0
VITE_DEFAULT_LANGUAGE=en
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully with your Firebase configuration!');
  console.log('📁 File location:', envPath);
  console.log('\n🔧 Next steps:');
  console.log('1. Add your Telegram bot token to VITE_TELEGRAM_BOT_TOKEN');
  console.log('2. Add your Telegram bot username to VITE_TELEGRAM_BOT_USERNAME');
  console.log('3. Restart your development server: npm run dev');
  console.log('\n⚠️  Make sure to add the following domains to Firebase Authorized Domains:');
  console.log('   - localhost');
  console.log('   - 127.0.0.1');
  console.log('   - Your production domain (if any)');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
} 