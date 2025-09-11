# Telegram Payment Webhook Setup Guide

## 🎯 **Overview**
This guide shows you how to set up the payment webhook URL in BotFather for your Telegram bot to handle payments.

## 📋 **Prerequisites**
- ✅ Telegram bot created with BotFather
- ✅ Bot token from BotFather
- ✅ Backend server running (local or production)
- ✅ HTTPS URL (required for production)

## 🔧 **Step-by-Step Setup**

### **Step 1: Get Your Webhook URL**

#### **For Production:**
```
https://your-backend-domain.com/api/telegram/payment-webhook
```

#### **For Local Development (using ngrok):**
1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com)
2. Start your backend: `python app_new.py`
3. In another terminal, run: `ngrok http 5000`
4. Use the HTTPS URL provided by ngrok:
   ```
   https://abc123.ngrok.io/api/telegram/payment-webhook
   ```

### **Step 2: Set Webhook via BotFather**

#### **Method 1: Using BotFather Commands**
1. Open Telegram and go to [@BotFather](https://t.me/botfather)
2. Send `/mybots` and select your bot
3. Go to **"Bot Settings"** → **"Payments"**
4. Select **"Payment Provider"** → **"Chapa"**
5. Enter your Chapa provider token
6. When prompted for webhook URL, enter your webhook URL

#### **Method 2: Using the Setup Script**
1. Navigate to your backend directory
2. Run the setup script:
   ```bash
   python setup_telegram_webhook.py
   ```
3. Follow the interactive prompts

#### **Method 3: Direct API Call**
```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-backend-domain.com/api/telegram/payment-webhook",
       "allowed_updates": ["pre_checkout_query", "successful_payment", "shipping_query"]
     }'
```

### **Step 3: Verify Setup**

#### **Check Current Webhook**
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

#### **Expected Response**
```json
{
  "ok": true,
  "result": {
    "url": "https://your-backend-domain.com/api/telegram/payment-webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": 0,
    "last_error_message": "",
    "max_connections": 40,
    "allowed_updates": ["pre_checkout_query", "successful_payment", "shipping_query"]
  }
}
```

## 🧪 **Testing Your Webhook**

### **Test with Setup Script**
```bash
python setup_telegram_webhook.py
# Choose option 3: Test webhook
```

### **Manual Test**
```bash
curl -X POST "https://your-backend-domain.com/api/telegram/payment-webhook" \
     -H "Content-Type: application/json" \
     -d '{
       "update_id": 123456789,
       "pre_checkout_query": {
         "id": "test_query_id",
         "from": {
           "id": 123456789,
           "is_bot": false,
           "first_name": "Test",
           "username": "testuser"
         },
         "currency": "ETB",
         "total_amount": 1000,
         "invoice_payload": "deposit|10"
       }
     }'
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. "Bad Request: wrong webhook URL"**
- ✅ Ensure URL starts with `https://`
- ✅ Check that the URL is accessible
- ✅ Verify the endpoint exists in your backend

#### **2. "Bad Request: webhook URL must be HTTPS"**
- ✅ Use HTTPS URL (required for production)
- ✅ For local testing, use ngrok or similar service

#### **3. "Bad Request: webhook can be set only for bots"**
- ✅ Ensure you're using a bot token, not a user token
- ✅ Verify the bot token is correct

#### **4. "Bad Request: webhook URL must be accessible"**
- ✅ Check if your server is running
- ✅ Verify the URL is publicly accessible
- ✅ Test the URL in a browser

#### **5. "Bad Request: webhook URL must be a valid URL"**
- ✅ Check URL format
- ✅ Ensure no extra spaces or characters
- ✅ Verify the domain is valid

### **Debug Steps**

1. **Check Bot Token**
   ```bash
   curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getMe"
   ```

2. **Check Webhook Info**
   ```bash
   curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
   ```

3. **Test Endpoint Manually**
   ```bash
   curl -X GET "https://your-backend-domain.com/api/telegram/payment-webhook"
   ```

4. **Check Backend Logs**
   - Look for incoming webhook requests
   - Check for error messages
   - Verify database connections

## 📝 **Environment Variables**

Add these to your `.env` file:

```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_PAYMENT_PROVIDER_TOKEN=your_chapa_provider_token_from_botfather

# Webhook URL (optional, can be set via script)
WEBHOOK_URL=https://your-backend-domain.com/api/telegram/payment-webhook
```

## 🚀 **Production Deployment**

### **For Production Servers:**
1. Ensure your server has HTTPS enabled
2. Use a valid SSL certificate
3. Set the webhook URL to your production domain
4. Monitor webhook delivery in your logs

### **For Cloud Platforms:**
- **Heroku**: Use your app's HTTPS URL
- **Railway**: Use the provided HTTPS URL
- **Render**: Use the HTTPS URL from your service
- **Vercel**: Use your custom domain or Vercel URL

## 📊 **Monitoring**

### **Check Webhook Status**
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

### **Monitor Logs**
- Check your backend logs for webhook requests
- Monitor for failed deliveries
- Track payment processing success rates

## 🔄 **Updating Webhook**

### **Change Webhook URL**
```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://new-domain.com/api/telegram/payment-webhook"
     }'
```

### **Delete Webhook**
```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook"
```

## ✅ **Success Indicators**

When your webhook is properly set up, you should see:

1. ✅ Webhook URL is set correctly
2. ✅ No pending updates (0)
3. ✅ No error messages
4. ✅ Payment invoices can be created
5. ✅ Payment callbacks are received
6. ✅ User wallets are updated automatically

## 🆘 **Getting Help**

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Verify your bot token and webhook URL**
3. **Test with the setup script**
4. **Check your backend logs**
5. **Ensure your server is accessible**

## 📚 **Additional Resources**

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Payments Documentation](https://core.telegram.org/bots/payments)
- [Chapa API Documentation](https://docs.chapa.co/)

---

**🎉 Once your webhook is set up, your Telegram bot will be able to handle payments automatically!** 