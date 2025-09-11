# 🎮 Ultimate Bingo Game Platform

A modern, feature-rich Bingo game platform built with React, TypeScript, Firebase, and advanced gaming technologies. This platform includes real-time multiplayer gameplay, power-ups, tournaments, achievements, and secure payment integration with Chapa.

## 🚀 Features

### 🎯 Core Gaming Features
- **75-Ball Bingo**: Classic 5x5 grid with free center space
- **Real-time Multiplayer**: Live games with up to 10 players using WebSockets
- **Multiple Game Modes**: Classic, Speed, Pattern, and Tournament modes
- **Advanced Bingo Cards**: Dynamic card generation with multiple patterns
- **Voice Announcements**: AI-powered voice system for number calling and game announcements
- **Prize Pool System**: Automatic prize distribution with ETB currency
- **Game Statistics**: Comprehensive player and game analytics

### ⚡ Power-ups & Enhancements
- **Free Space**: Mark any square as free
- **Double Points**: Earn double points for marked numbers
- **Skip Number**: Skip the next called number
- **Extra Time**: Get additional time to mark numbers
- **Hint System**: Get hints for potential winning patterns
- **Auto-Mark**: Automatically mark called numbers

### 🏆 Tournament System
- **Elimination Tournaments**: Knockout-style competitions
- **Points Tournaments**: Accumulate points across multiple games
- **Survival Tournaments**: Last player standing format
- **Scheduled Events**: Pre-scheduled tournament times
- **Prize Pools**: Guaranteed prize money for winners
- **Leaderboards**: Real-time tournament rankings

### 🎖️ Achievements & Rewards
- **Achievement System**: Unlock achievements for various accomplishments
- **Daily Rewards**: Daily login bonuses with streak multipliers
- **Badge Collection**: Collect rare and legendary badges
- **Experience Points**: Level up and unlock new features
- **Progression System**: Track player advancement over time

### 💰 Financial System
- **ETB Currency**: Ethiopian Birr integration throughout
- **Secure Payments**: Chapa payment gateway integration
- **Multiple Payment Types**: Wallet deposits, game entries, tournament fees, power-up purchases
- **Player Transfers**: Peer-to-peer fund transfers
- **Transaction History**: Complete financial tracking
- **Withdrawal System**: Bank transfer integration

### 💬 Social Features
- **Real-time Chat**: Live chat during games with emojis and quick messages
- **Player Profiles**: Customizable avatars, themes, and statistics
- **Friend System**: Add friends and play together
- **Leaderboards**: Global, weekly, and monthly rankings
- **Player Blocking**: Block unwanted players
- **Reporting System**: Report inappropriate behavior

### 👑 Advanced Admin System
- **Multi-Method Admin Identification**:
  - Email-based admin verification
  - Phone number verification
  - Telegram ID integration
  - First-user automatic admin
  - Custom UID whitelist
- **Comprehensive Admin Panel**: User management, game oversight, transaction monitoring
- **Real-time Analytics**: Live game statistics and player metrics
- **Support Ticket System**: Integrated customer support

### 🎵 Voice & Audio System
- **Number Calling**: AI voice announcements for each called number
- **Game Announcements**: Start, end, and winner announcements
- **Customizable Audio**: Volume control and sound preferences
- **Text-to-Speech**: Dynamic announcements for game events
- **Sound Effects**: Immersive gaming audio experience

### 📱 Mobile-First Design
- **Progressive Web App**: Installable mobile application
- **Responsive Design**: Optimized for all screen sizes
- **Touch Controls**: Mobile-optimized interactions
- **Offline Support**: Basic functionality without internet
- **Push Notifications**: Game alerts and updates

### 🔐 Security & Authentication
- **Google Authentication**: Secure OAuth integration
- **Firestore Security Rules**: Comprehensive data protection
- **Admin Verification**: Multi-layer admin access control
- **Transaction Security**: Encrypted financial operations
- **Rate Limiting**: Protection against abuse

### ♿ Accessibility Features
- **High Contrast Mode**: Enhanced visibility for visually impaired users
- **Screen Reader Support**: Full compatibility with assistive technologies
- **Large Text Options**: Adjustable text sizes
- **Color Blind Mode**: Special color schemes for color vision deficiency
- **Keyboard Navigation**: Full keyboard accessibility

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Advanced animations and transitions
- **Socket.io Client**: Real-time WebSocket communication
- **React Query**: Server state management
- **React Hook Form**: Form handling and validation

### Backend & Services
- **Firebase Firestore**: Real-time NoSQL database
- **Firebase Authentication**: User management and security
- **Firebase Hosting**: Global CDN deployment
- **Firebase Functions**: Serverless backend operations
- **Flask**: Python backend for payment processing
- **WebSocket Server**: Real-time game communication

### Audio & Voice
- **Web Audio API**: Advanced audio processing
- **Speech Synthesis**: Text-to-speech capabilities
- **Custom Audio Engine**: Optimized for gaming

### Payment Integration
- **Chapa Payment Gateway**: Ethiopian payment processing
- **Webhook System**: Secure payment verification
- **Transaction Logging**: Complete financial audit trail

### Development Tools
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality assurance
- **TypeScript**: Static type checking

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Python 3.8+ (for backend)
- Firebase account
- Chapa payment account (for payments)

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

### 3. Environment Configuration
Create `.env.local` file in the root directory:
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

### 4. Firebase Configuration
Create a Firebase project and add your configuration to `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 5. Backend Configuration
Create `.env` file in the backend directory:
```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
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

### 6. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 7. Start Development Servers
```bash
# Start frontend development server
npm run dev

# Start backend server (in another terminal)
cd backend
python app.py
```

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Backend Deployment (Render)
```bash
# Use the provided deployment scripts
./deploy-render.sh
# or
deploy-render.bat
```

### Custom Domain
1. Add custom domain in Firebase Console
2. Update DNS records
3. Configure SSL certificate

### Environment Configuration
Set production environment variables in Firebase Console:
- `VITE_FIREBASE_API_KEY`
- `VITE_CHAPA_SECRET_KEY`
- `VITE_APP_URL`
- `VITE_BACKEND_URL`
- `VITE_WEBSOCKET_URL`

## 🎮 Game Rules & Mechanics

### Standard Bingo Rules
- **Card Layout**: 5x5 grid with free center space
- **Number Ranges**: 
  - B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
- **Winning Patterns**: Horizontal, vertical, diagonal lines
- **Prize Distribution**: 90% to winner, 10% platform fee

### Game Modes
- **Classic Mode**: Traditional bingo with standard rules
- **Speed Mode**: Faster number calling and shorter games
- **Pattern Mode**: Specific patterns must be completed to win
- **Tournament Mode**: Competitive events with prizes

### Power-ups
- **Free Space**: Mark any square as free (50 coins)
- **Double Points**: Earn double points for marked numbers (100 coins)
- **Skip Number**: Skip the next called number (75 coins)
- **Extra Time**: Get 30 seconds additional time (25 coins)
- **Hint**: Get a hint for potential winning patterns (150 coins)
- **Auto-Mark**: Automatically mark called numbers (200 coins)

## 💳 Payment Integration

### Chapa Payment Setup
1. **Get Chapa Credentials**:
   - Visit [Chapa Developer Portal](https://developer.chapa.co/)
   - Create an account and get your API keys
   - Use test keys for development

2. **Configure Webhooks**:
   - Set webhook URL: `https://your-backend-url.com/api/payment-callback`
   - Configure in Chapa dashboard

3. **Payment Types**:
   - **Wallet Deposits**: Add funds to player wallet
   - **Game Entry Fees**: Pay to join games
   - **Tournament Entry**: Pay tournament registration fees
   - **Power-up Purchases**: Buy in-game power-ups

### Payment Flow
1. **Frontend initiates payment** → Calls `/api/payment/initiate`
2. **Backend creates Chapa transaction** → Calls Chapa initialize API
3. **User redirected to Chapa** → Completes payment on Chapa's secure page
4. **Chapa sends webhook** → Calls your `/api/payment-callback` endpoint
5. **Backend verifies payment** → Updates user wallet and logs transaction

## 🔧 Advanced Configuration

### Voice System Setup
1. Add sound files to `public/sounds/`
2. Configure voice settings in `VoiceService`
3. Test audio playback across devices

### Admin System Configuration
1. Set admin emails in `AdminService`
2. Configure Telegram bot integration
3. Set up admin notification system

### WebSocket Configuration
1. Configure WebSocket server URL
2. Set up authentication for WebSocket connections
3. Test real-time features

### Payment Integration
1. Configure Chapa webhooks
2. Set up transaction monitoring
3. Test payment flows

## 📊 Analytics & Monitoring

### Game Analytics
- Player engagement metrics
- Game completion rates
- Revenue tracking
- Performance monitoring

### Admin Dashboard
- Real-time user statistics
- Financial reports
- Support ticket management
- System health monitoring

## 🔒 Security Features

### Data Protection
- Encrypted user data
- Secure payment processing
- Rate limiting and DDoS protection
- Regular security audits

### Admin Security
- Multi-factor authentication
- IP whitelisting
- Activity logging
- Access control audit trails

## 🎯 Performance Optimization

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Bundle size optimization

### Backend Optimization
- Database indexing
- Query optimization
- Caching layers
- CDN integration

## 📱 Mobile Optimization

### PWA Features
- Offline functionality
- Push notifications
- App-like experience
- Background sync

### Performance
- Fast loading times
- Smooth animations
- Touch-optimized UI
- Battery efficiency

## 🔄 Continuous Integration

### Automated Testing
- Unit tests with Jest
- Integration tests
- E2E tests with Playwright
- Performance testing

### Deployment Pipeline
- Automated builds
- Quality gates
- Staging environment
- Production deployment

## 📈 Scaling Strategy

### Horizontal Scaling
- Load balancing
- Database sharding
- CDN distribution
- Microservices architecture

### Performance Monitoring
- Real-time metrics
- Error tracking
- User experience monitoring
- Capacity planning

## 🎨 Customization

### Theming
- Custom color schemes
- Brand integration
- Localization support
- Accessibility features

### Game Variants
- Custom bingo patterns
- Special game modes
- Tournament systems
- Seasonal events

## 📞 Support & Maintenance

### Documentation
- API documentation
- User guides
- Admin manuals
- Developer documentation

### Support System
- Integrated help desk
- FAQ system
- Video tutorials
- Community forums

## 🔮 Future Enhancements

### Planned Features
- AI-powered game moderation
- Advanced tournament systems
- Social features and leaderboards
- Blockchain integration
- AR/VR support

### Technology Upgrades
- WebRTC for voice chat
- WebSocket optimization
- Machine learning integration
- Advanced analytics

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Contact

For support and inquiries:
- Email: support@bingogame.com
- Telegram: @BingoGameSupport
- Website: https://bingogame.com

---

**Built with ❤️ for the Ethiopian gaming community**

## 🎯 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.8+ installed
- [ ] Firebase project created
- [ ] Chapa account configured
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Firebase rules deployed
- [ ] Backend server running
- [ ] Frontend development server running
- [ ] Payment webhooks configured
- [ ] Admin accounts set up
- [ ] Test payments completed
- [ ] Real-time features tested

## 🚀 Production Checklist

- [ ] Environment variables configured for production
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] CDN setup
- [ ] Monitoring and logging configured
- [ ] Backup systems in place
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Support system ready
- [ ] Analytics tracking enabled 