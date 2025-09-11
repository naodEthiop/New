// Debug Firebase Configuration
console.log('🔍 Firebase Debug Information');
console.log('============================');

// Show current domain
console.log('Current Domain:', window.location.hostname);
console.log('Full URL:', window.location.href);
console.log('Protocol:', window.location.protocol);

// Show Firebase config
console.log('Firebase Config:');
console.log('- API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('- Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);

// Check if we're in development
console.log('Environment:', import.meta.env.MODE);
console.log('Is Development:', import.meta.env.DEV);

// Show all environment variables (without values for security)
console.log('Environment Variables Check:');
const envVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

envVars.forEach(varName => {
  const value = import.meta.env[varName];
  console.log(`- ${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
});

// Test Firebase connection
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

try {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  console.log('Firebase Config Object:', firebaseConfig);
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  console.log('✅ Firebase initialized successfully');
  console.log('Auth Domain:', auth.config.authDomain);
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

console.log('============================');
console.log('📝 Next Steps:');
console.log('1. Check the "Current Domain" above');
console.log('2. Make sure this domain is in Firebase Console');
console.log('3. Check "Auth Domain" matches your Firebase project');
console.log('4. Verify all environment variables are set'); 