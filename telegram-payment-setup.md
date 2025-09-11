# Telegram Payment Integration Setup Guide

## Overview
This guide explains how to connect your Telegram bot payments (configured in BotFather) to your existing Chapa integration in the Bingo project.

## What We've Added

### 1. Backend Integration (`project/backend/app.py`)
- **Telegram Payment Webhook Handler**: `/api/telegram/payment-webhook`
- **Payment Processing Functions**: 
  - `handle_pre_checkout_query()` - Validates payments before processing
  - `handle_successful_payment()` - Processes completed payments
  - `process_telegram_deposit()` - Handles wallet deposits
  - `process_telegram_game_entry()` - Handles game entry payments
- **Invoice Creation**: `create_telegram_payment_invoice()` - Creates payment invoices

### 2. Frontend Integration (`project/src/services/telegramPaymentService.ts`)
- **Telegram Payment Service**: Handles payment requests from the web app
- **Invoice Creation**: Creates payment invoices for deposits and game entries
- **User Management**: Checks if users have linked Telegram accounts

### 3. UI Updates (`project/src/components/DepositModal.tsx`)
- **Dual Payment Options**: Users can choose between Chapa web payments and Telegram payments
- **Telegram Integration**: Shows Telegram payment option for linked accounts

## Environment Variables Required

Add these to your `.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_PAYMENT_PROVIDER_TOKEN=your_chapa_provider_token_from_botfather

# Backend URL (for frontend)
VITE_BACKEND_URL=http://localhost:5000

# Existing Chapa Configuration (keep these)
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key
CHAPA_BASE_URL=https://api.chapa.co/v1
```

## BotFather Configuration

### 1. Payment Provider Setup
1. Go to [@BotFather](https://t.me/botfather) in Telegram
2. Send `/mybots` and select your bot
3. Go to "Payments" → "Add payment method"
4. Select "Chapa" as your payment provider
5. Enter your Chapa credentials:
   - **Token**: Your Chapa provider token
   - **Currency**: ETB
   - **Test Mode**: Enable for testing

### 2. Webhook Setup
Set your payment webhook URL to:
```
https://your-backend-domain.com/api/telegram/payment-webhook
```

## How It Works

### 1. User Flow
1. **Web App**: User clicks "Pay via Telegram" in deposit modal
2. **Frontend**: Creates payment invoice and sends to user's Telegram
3. **Telegram**: User receives payment invoice and completes payment
4. **Webhook**: Backend receives payment confirmation
5. **Processing**: Backend updates user's wallet balance
6. **Confirmation**: User receives success message

### 2. Bot Commands
Users can also use these commands directly in Telegram:
- `/deposit <amount>` - Request deposit payment
- `/join <game_id>` - Join a game with payment (if entry fee required)
- `/balance` - Check wallet balance

### 3. Payment Types
- **Deposits**: `deposit|amount` payload
- **Game Entries**: `game_entry|game_id|amount` payload

## Testing

### 1. Test Payment Flow
1. Link your Telegram account in the web app
2. Try depositing via Telegram payment option
3. Check if payment invoice appears in Telegram
4. Complete test payment
5. Verify wallet balance updates

### 2. Test Bot Commands
1. Send `/start` to your bot
2. Try `/deposit 100` to test deposit
3. Try `/balance` to check balance
4. Try `/join <game_id>` to test game entry

## Security Features

### 1. Payment Validation
- Pre-checkout queries validate payments before processing
- Amount limits enforced (10-50,000 ETB)
- User authentication required

### 2. Transaction Tracking
- All Telegram payments logged with metadata
- Payment charge IDs stored for reconciliation
- Source tracking (`telegram_bot` vs `web`)

### 3. User Linking
- Telegram chat IDs linked to Firebase users
- Automatic user creation for new Telegram users
- Username-based fallback linking

## Troubleshooting

### Common Issues

1. **"TELEGRAM_BOT_TOKEN not set"**
   - Check your environment variables
   - Ensure bot token is correct

2. **"Provider token not found"**
   - Verify your Chapa provider token in BotFather
   - Check environment variable `TELEGRAM_PAYMENT_PROVIDER_TOKEN`

3. **"User not found"**
   - Ensure user has linked Telegram account
   - Check if user exists in Firebase

4. **Payment not processing**
   - Check webhook URL is accessible
   - Verify webhook is receiving updates
   - Check backend logs for errors

### Debug Commands

Add these to your backend for debugging:

```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Test webhook endpoint
@app.route('/api/telegram/test-webhook', methods=['POST'])
def test_webhook():
    print("Webhook received:", request.json)
    return jsonify({'status': 'ok'})
```

## Production Deployment

### 1. HTTPS Required
- Telegram requires HTTPS for webhooks
- Use ngrok for local testing
- Deploy to production with SSL

### 2. Environment Variables
- Set all required environment variables
- Use secure secret management
- Never commit tokens to version control

### 3. Monitoring
- Monitor webhook endpoints
- Track payment success/failure rates
- Set up alerts for payment errors

## Support

If you encounter issues:
1. Check the backend logs for error messages
2. Verify all environment variables are set
3. Test webhook connectivity
4. Ensure Chapa integration is working

The integration now provides a seamless payment experience across both web and Telegram platforms! 🎉 