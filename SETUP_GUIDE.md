# 🎮 Ultimate Bingo Game Platform - Setup Guide

This guide will help you set up the enhanced bingo game platform with all the new features including real-time multiplayer, power-ups, tournaments, achievements, and Chapa payment integration.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.8+** - [Download here](https://www.python.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Firebase CLI** - Install with `npm install -g firebase-tools`
- **Chapa Account** - [Sign up here](https://chapa.co/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Environment Setup

Create the following environment files:

#### Frontend (.env.local)
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Backend Configuration
VITE_BACKEND_URL=http://localhost:5000
VITE_WEBSOCKET_URL=ws://localhost:5000/ws

# Chapa Payment Configuration
VITE_CHAPA_PUBLIC_KEY=your-chapa-public-key
VITE_CHAPA_SECRET_KEY=your-chapa-secret-key
VITE_CHAPA_BASE_URL=https://api.chapa.co/v1

# App Configuration
VITE_APP_URL=http://localhost:5173
```

#### Backend (.env)
```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url

# Chapa Configuration
CHAPA_SECRET_KEY=your-chapa-secret-key
CHAPA_PUBLIC_KEY=your-chapa-public-key
CHAPA_BASE_URL=https://api.chapa.co/v1

# App Configuration
FRONTEND_URL=http://localhost:5173
CALLBACK_BASE_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Google provider)
   - Enable Firestore Database
   - Enable Hosting

2. **Get Firebase Configuration**
   - Go to Project Settings
   - Add a web app
   - Copy the configuration to your `.env.local` file

3. **Get Firebase Admin SDK**
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download the JSON file and copy values to backend `.env`

4. **Deploy Firestore Rules**
   ```bash
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```

### 5. Chapa Payment Setup

1. **Create Chapa Account**
   - Sign up at [Chapa](https://chapa.co/)
   - Complete verification process

2. **Get API Keys**
   - Go to Developer Dashboard
   - Copy your public and secret keys
   - Add to environment files

3. **Configure Webhooks**
   - Set webhook URL: `https://your-backend-url.com/api/payment-callback`
   - Configure in Chapa dashboard

### 6. Start Development Servers

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start backend
cd backend
python app.py
```

## 🔧 Advanced Configuration

### WebSocket Server Setup

The WebSocket server is integrated into the Flask backend. Ensure your backend is running for real-time features.

### Voice System Configuration

1. **Add Sound Files**
   - Place audio files in `public/sounds/`
   - Supported formats: MP3, WAV, OGG

2. **Configure Voice Settings**
   - Edit `src/services/voiceService.ts`
   - Adjust volume and voice preferences

### Admin System Setup

1. **Set Admin Emails**
   - Edit `src/services/adminService.ts`
   - Add admin email addresses

2. **Configure Telegram Bot** (Optional)
   - Create Telegram bot via BotFather
   - Add bot token to environment variables

### Database Structure

The platform uses Firestore with the following collections:

- `users` - User profiles and statistics
- `games` - Game rooms and sessions
- `transactions` - Payment history
- `tournaments` - Tournament data
- `achievements` - Achievement definitions
- `leaderboards` - Player rankings

## 🎮 Game Features Configuration

### Power-ups

Power-ups are configured in the game types. Available power-ups:

- **Free Space** (50 coins) - Mark any square as free
- **Double Points** (100 coins) - Earn double points
- **Skip Number** (75 coins) - Skip next called number
- **Extra Time** (25 coins) - Get 30 seconds additional time
- **Hint** (150 coins) - Get pattern hints
- **Auto-Mark** (200 coins) - Auto-mark called numbers

### Tournament System

Tournaments are automatically scheduled and managed. Types:

- **Elimination** - Knockout style
- **Points** - Accumulate points
- **Survival** - Last player standing

### Achievement System

Achievements are automatically tracked and awarded for:

- Games played/won
- Streaks maintained
- Power-ups used
- Tournament participation
- Daily logins

## 🔒 Security Configuration

### Firestore Security Rules

Deploy secure Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Games
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.hostId == request.auth.uid || 
         request.auth.token.admin == true);
    }
    
    // Transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### Payment Security

- All payment data is encrypted
- Webhook verification ensures payment authenticity
- Transaction logging for audit trails

## 📱 Mobile Optimization

### PWA Configuration

The app is configured as a Progressive Web App:

- Offline functionality
- Push notifications
- App-like experience
- Installable on mobile devices

### Responsive Design

- Mobile-first approach
- Touch-optimized controls
- Adaptive layouts
- Performance optimization

## 🚀 Deployment

### Frontend Deployment (Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting
```

### Backend Deployment (Render)

Use the provided deployment scripts:

```bash
# Linux/Mac
./deploy-render.sh

# Windows
deploy-render.bat
```

### Environment Variables for Production

Set these in your hosting platform:

- `VITE_FIREBASE_API_KEY`
- `VITE_CHAPA_SECRET_KEY`
- `VITE_APP_URL`
- `VITE_BACKEND_URL`
- `VITE_WEBSOCKET_URL`

## 🧪 Testing

### Frontend Testing

```bash
npm run test
```

### Backend Testing

```bash
cd backend
python -m pytest
```

### Payment Testing

Use Chapa test credentials for development:

- Test cards provided by Chapa
- Test webhook endpoints
- Verify payment flows

## 📊 Monitoring and Analytics

### Firebase Analytics

- User engagement tracking
- Game performance metrics
- Error monitoring
- Performance insights

### Custom Analytics

- Game completion rates
- Revenue tracking
- Player behavior analysis
- Tournament statistics

## 🔧 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check backend server is running
   - Verify WebSocket URL in environment
   - Check firewall settings

2. **Payment Integration Issues**
   - Verify Chapa API keys
   - Check webhook configuration
   - Test with Chapa test environment

3. **Firebase Connection Issues**
   - Verify Firebase configuration
   - Check Firestore rules
   - Ensure authentication is enabled

4. **Voice System Not Working**
   - Check browser permissions
   - Verify audio files exist
   - Test with different browsers

### Performance Optimization

1. **Bundle Size**
   - Use code splitting
   - Optimize images
   - Enable compression

2. **Database Queries**
   - Add proper indexes
   - Optimize queries
   - Use pagination

3. **Real-time Updates**
   - Implement rate limiting
   - Use efficient WebSocket messages
   - Optimize re-renders

## 📞 Support

For additional support:

- Check the main README.md
- Review Firebase documentation
- Consult Chapa API docs
- Contact the development team

## 🎯 Next Steps

After setup, consider:

1. **Customization**
   - Branding and theming
   - Custom game rules
   - Special events

2. **Scaling**
   - Load balancing
   - Database optimization
   - CDN integration

3. **Features**
   - Additional game modes
   - Social features
   - Advanced analytics

---

**Happy Gaming! 🎮**
