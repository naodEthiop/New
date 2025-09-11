# Bingo Backend - Modular Structure

This is the modular backend for the Bingo game application, featuring Telegram payment integration and Chapa payment processing.

## 🏗️ Project Structure

```
backend/
├── config/
│   ├── __init__.py
│   └── settings.py          # Configuration management
├── database/
│   ├── __init__.py
│   └── firebase.py          # Firebase database connection
├── services/
│   ├── __init__.py
│   ├── chapa_service.py     # Chapa payment service
│   └── telegram_service.py  # Telegram bot service
├── routes/
│   ├── __init__.py
│   ├── payment_routes.py    # Payment-related endpoints
│   └── telegram_routes.py   # Telegram-related endpoints
├── app_new.py              # Main application file
├── requirements_new.txt    # Python dependencies
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements_new.txt
```

### 2. Environment Variables
Create a `.env` file in the backend directory:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_DEBUG=True
ENVIRONMENT=development

# Frontend URL
VITE_FRONTEND_URL=http://localhost:3000

# Chapa Configuration
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key
CHAPA_BASE_URL=https://api.chapa.co/v1

# Callback Configuration
CALLBACK_BASE_URL=http://localhost:5000

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_PAYMENT_PROVIDER_TOKEN=your_chapa_provider_token_from_botfather

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", ...}

# PlayHT Configuration (for TTS)
PLAYHT_API_KEY=your_playht_api_key
PLAYHT_USER_ID=your_playht_user_id
```

### 3. Run the Application
```bash
python app_new.py
```

## 📋 Features

### 🔐 Authentication
- Firebase Authentication integration
- JWT token validation
- User management

### 💳 Payment Processing
- **Chapa Integration**: Web-based payments
- **Telegram Payments**: Bot-based payments via BotFather
- Payment verification and callbacks
- Transaction tracking

### 🤖 Telegram Bot
- Webhook handling
- Payment invoice creation
- User commands (`/deposit`, `/balance`, `/join`)
- Automatic user linking

### 🎮 Game Management
- Game room creation and management
- Player management
- Real-time updates

## 🔧 Configuration

### Environment-Specific Configs
The application supports different configurations for different environments:

- **Development**: Debug mode, local URLs
- **Production**: Optimized settings, production URLs
- **Testing**: Test-specific configurations

### CORS Configuration
Configured to allow requests from:
- Local development servers
- Production frontend URLs
- Vercel deployments

## 📡 API Endpoints

### Health & Status
- `GET /health` - Health check
- `GET /api/test` - API test endpoint
- `GET /` - API information

### Payments
- `POST /api/create-payment` - Create Chapa payment
- `POST /api/wallet/deposit` - Process wallet deposit
- `POST /api/payment-callback` - Handle payment callbacks
- `GET /api/verify-payment/<tx_ref>` - Verify payment

### Telegram
- `POST /api/telegram/webhook` - Telegram webhook
- `POST /api/telegram/payment-webhook` - Telegram payment webhook
- `POST /api/telegram/login` - Telegram login
- `GET /api/telegram/user/telegram-chat-id` - Get user's Telegram chat ID

## 🔒 Security Features

### Authentication
- Firebase ID token validation
- Secure token handling
- User session management

### Payment Security
- Payment verification
- Transaction logging
- Fraud detection (basic)

### Data Protection
- Environment variable usage
- Secure configuration management
- Input validation

## 🚀 Deployment

### Local Development
```bash
python app_new.py
```

### Production (Gunicorn)
```bash
gunicorn app_new:app -b 0.0.0.0:5000
```

### Docker (if needed)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements_new.txt .
RUN pip install -r requirements_new.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "app_new:app", "-b", "0.0.0.0:5000"]
```

## 🔍 Monitoring & Logging

### Health Checks
- `/health` endpoint provides system status
- Database connectivity check
- Service availability monitoring

### Logging
- Console logging for development
- Structured logging for production
- Error tracking and reporting

## 🧪 Testing

### Manual Testing
1. Health check: `curl http://localhost:5000/health`
2. API test: `curl http://localhost:5000/api/test`
3. Payment creation: Use the frontend or Postman

### Integration Testing
- Telegram webhook testing
- Payment callback testing
- Database operations testing

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Check `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable
   - Verify service account permissions

2. **Telegram Webhook Issues**
   - Ensure HTTPS is configured for production
   - Check bot token validity
   - Verify webhook URL accessibility

3. **Payment Processing Errors**
   - Verify Chapa credentials
   - Check callback URL configuration
   - Monitor payment logs

### Debug Mode
Set `FLASK_DEBUG=True` in your `.env` file for detailed error messages and auto-reload.

## 📚 Documentation

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Chapa API Documentation](https://docs.chapa.co/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Flask Documentation](https://flask.palletsprojects.com/)

## 🤝 Contributing

1. Follow the modular structure
2. Add proper error handling
3. Include logging for debugging
4. Update documentation
5. Test thoroughly

## 📄 License

This project is part of the Bingo game application. 