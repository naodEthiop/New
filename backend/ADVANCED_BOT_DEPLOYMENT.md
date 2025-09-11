# Advanced Telegram Bot Deployment Guide

## Overview
The Advanced Telegram Bot provides multi-language support, phone registration, profile management, wallet integration, and achievement tracking for the Bingo game.

## Features
- 🌐 Multi-language support (English, Amharic)
- 📱 Phone number registration via Telegram contact sharing
- 👤 User profile management
- 💰 Wallet balance checking
- 🏆 Achievement tracking
- 🎮 Game integration
- 🆘 Support system

## Prerequisites
1. Python 3.8+
2. Telegram Bot Token (from @BotFather)
3. Firebase configuration
4. Required Python packages (see requirements.txt)

## Installation

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file in the backend directory:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url
```

## Deployment Options

### Option 1: Development (Polling)
For development and testing:

```bash
# Run directly
python run_advanced_bot.py

# Or using the runner
python advanced_bot_runner.py
```

### Option 2: Production (Webhook)
For production deployment:

```bash
# Set webhook URL and port
python advanced_bot_runner.py webhook https://your-domain.com/telegram/webhook 8443
```

### Option 3: Integrated with Flask App
The advanced bot can be integrated with the main Flask application:

```bash
# Start the Flask app
python app.py

# Then start the advanced bot via API
curl -X POST http://localhost:5000/api/advanced-bot/start
```

## Bot Commands

### Available Commands
- `/start` - Welcome message and main menu
- `/help` - Show available commands
- `/register` - Register phone number
- `/profile` - Show user profile
- `/balance` - Show wallet balance
- `/wallet` - Wallet management
- `/achievements` - Show achievements
- `/language` - Change language
- `/support` - Get support

### Phone Registration Flow
1. User sends `/register`
2. Bot shows contact request button
3. User shares their phone number
4. Bot stores phone number in Firebase
5. User can now use all bot features

## Configuration

### Language Support
The bot supports multiple languages. To add a new language:

1. Update the `supported_languages` parameter in bot initialization
2. Add translations to the `get_text` method in `telegram_service.py`

### Firebase Integration
The bot automatically:
- Creates user profiles when phone numbers are registered
- Updates user data when commands are used
- Tracks achievements and game statistics

## Monitoring and Logging

### Logs
The bot logs all activities. Check logs for:
- User registrations
- Command usage
- Errors and exceptions

### Health Check
Monitor bot status:
```bash
curl http://localhost:5000/api/advanced-bot/status
```

## Security Considerations

### Webhook Security
When using webhooks:
1. Use HTTPS
2. Validate webhook requests
3. Set proper firewall rules
4. Use strong bot tokens

### Data Privacy
- Phone numbers are stored securely in Firebase
- User data is encrypted in transit
- Follow GDPR/privacy regulations

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check bot token
   - Verify Firebase connection
   - Check logs for errors

2. **Phone registration fails**
   - Ensure user shares their own contact
   - Check Firebase permissions
   - Verify database connection

3. **Language not working**
   - Check language codes
   - Verify translations exist
   - Test with different users

### Debug Mode
Enable debug logging:
```python
logging.basicConfig(level=logging.DEBUG)
```

## Production Deployment

### Using Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "run_advanced_bot.py"]
```

### Using Systemd Service
Create `/etc/systemd/system/bingo-bot.service`:
```ini
[Unit]
Description=Bingo Advanced Telegram Bot
After=network.target

[Service]
Type=simple
User=botuser
WorkingDirectory=/path/to/bot
ExecStart=/usr/bin/python3 run_advanced_bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Using PM2
```bash
pm2 start run_advanced_bot.py --name "bingo-bot"
pm2 save
pm2 startup
```

## API Integration

### Start Bot
```bash
POST /api/advanced-bot/start
```

### Check Status
```bash
GET /api/advanced-bot/status
```

## Support

For issues and questions:
1. Check the logs
2. Review this documentation
3. Test with different configurations
4. Contact the development team

## Updates and Maintenance

### Updating the Bot
1. Pull latest code
2. Update dependencies
3. Restart the bot
4. Test functionality

### Backup
Regularly backup:
- Bot configuration
- User data (Firebase)
- Logs and monitoring data

---

**Note**: This advanced bot is designed to work alongside the main Bingo game application. Ensure proper integration and testing before production deployment. 