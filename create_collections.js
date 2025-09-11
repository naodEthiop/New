// ESM-compatible version for Node.js with 'type': 'module'
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

// Load service account key from JSON file
const serviceAccount = JSON.parse(
  await readFile('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const collections = [
  'users',
  'wallets',
  'games',
  'gameRooms',
  'transactions',
  'support_tickets',
  'admin_logs',
  'system_settings',
  'payment_webhooks',
  'user_sessions',
  'game_stats',
  'chat_messages',
  'voice_settings',
  'achievements',
  'user_achievements'
];

for (const col of collections) {
  const docRef = admin.firestore().collection(col).doc('_dummy');
  await docRef.set({_dummy: true});
  console.log(`Created dummy doc in ${col}`);
}

process.exit();