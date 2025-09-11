#!/usr/bin/env python3
"""
Telegram Webhook Setup Script
This script helps you set up the payment webhook for your Telegram bot.
"""

import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

def get_bot_token():
    """Get bot token from environment or user input"""
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    if not token:
        token = input("Enter your Telegram bot token: ").strip()
    return token

def get_webhook_url():
    """Get webhook URL from environment or user input"""
    url = os.getenv('WEBHOOK_URL')
    if not url:
        url = input("Enter your webhook URL (e.g., https://your-domain.com/api/telegram/payment-webhook): ").strip()
    return url

def set_webhook(bot_token, webhook_url):
    """Set the webhook URL for the bot"""
    url = f"https://api.telegram.org/bot{bot_token}/setWebhook"
    
    payload = {
        "url": webhook_url,
        "allowed_updates": ["pre_checkout_query", "successful_payment", "shipping_query"]
    }
    
    try:
        response = requests.post(url, json=payload)
        result = response.json()
        
        if result.get('ok'):
            print("✅ Webhook set successfully!")
            print(f"URL: {webhook_url}")
            return True
        else:
            print("❌ Failed to set webhook:")
            print(f"Error: {result.get('description', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error setting webhook: {e}")
        return False

def get_webhook_info(bot_token):
    """Get current webhook information"""
    url = f"https://api.telegram.org/bot{bot_token}/getWebhookInfo"
    
    try:
        response = requests.get(url)
        result = response.json()
        
        if result.get('ok'):
            webhook_info = result['result']
            print("\n📋 Current Webhook Information:")
            print(f"URL: {webhook_info.get('url', 'Not set')}")
            print(f"Pending Updates: {webhook_info.get('pending_update_count', 0)}")
            print(f"Last Error: {webhook_info.get('last_error_message', 'None')}")
            print(f"Max Connections: {webhook_info.get('max_connections', 40)}")
            return webhook_info
        else:
            print("❌ Failed to get webhook info")
            return None
            
    except Exception as e:
        print(f"❌ Error getting webhook info: {e}")
        return None

def delete_webhook(bot_token):
    """Delete the current webhook"""
    url = f"https://api.telegram.org/bot{bot_token}/deleteWebhook"
    
    try:
        response = requests.post(url)
        result = response.json()
        
        if result.get('ok'):
            print("✅ Webhook deleted successfully!")
            return True
        else:
            print("❌ Failed to delete webhook")
            return False
            
    except Exception as e:
        print(f"❌ Error deleting webhook: {e}")
        return False

def test_webhook(bot_token, webhook_url):
    """Test the webhook with a sample payload"""
    print("\n🧪 Testing webhook...")
    
    # Sample pre-checkout query payload
    test_payload = {
        "update_id": 123456789,
        "pre_checkout_query": {
            "id": "test_query_id",
            "from": {
                "id": 123456789,
                "is_bot": False,
                "first_name": "Test",
                "username": "testuser"
            },
            "currency": "ETB",
            "total_amount": 1000,
            "invoice_payload": "deposit|10"
        }
    }
    
    try:
        response = requests.post(webhook_url, json=test_payload, timeout=10)
        print(f"✅ Webhook test completed!")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Webhook test failed: {e}")
        return False

def main():
    """Main function"""
    print("🤖 Telegram Webhook Setup Script")
    print("=" * 40)
    
    # Get bot token
    bot_token = get_bot_token()
    if not bot_token:
        print("❌ Bot token is required!")
        return
    
    print(f"✅ Bot token: {bot_token[:10]}...")
    
    # Show current webhook info
    print("\n📋 Checking current webhook...")
    current_info = get_webhook_info(bot_token)
    
    # Get webhook URL
    webhook_url = get_webhook_url()
    if not webhook_url:
        print("❌ Webhook URL is required!")
        return
    
    print(f"✅ Webhook URL: {webhook_url}")
    
    # Ask user what to do
    print("\n🔧 What would you like to do?")
    print("1. Set new webhook")
    print("2. Delete current webhook")
    print("3. Test webhook")
    print("4. Show webhook info")
    print("5. Exit")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    if choice == "1":
        # Delete existing webhook first
        if current_info and current_info.get('url'):
            print("\n🗑️ Deleting existing webhook...")
            delete_webhook(bot_token)
        
        # Set new webhook
        print(f"\n🔗 Setting webhook to: {webhook_url}")
        success = set_webhook(bot_token, webhook_url)
        
        if success:
            print("\n📋 Updated webhook information:")
            get_webhook_info(bot_token)
            
            # Ask if user wants to test
            test_choice = input("\n🧪 Would you like to test the webhook? (y/n): ").strip().lower()
            if test_choice == 'y':
                test_webhook(bot_token, webhook_url)
    
    elif choice == "2":
        delete_webhook(bot_token)
    
    elif choice == "3":
        if not webhook_url:
            webhook_url = input("Enter webhook URL to test: ").strip()
        test_webhook(bot_token, webhook_url)
    
    elif choice == "4":
        get_webhook_info(bot_token)
    
    elif choice == "5":
        print("👋 Goodbye!")
    
    else:
        print("❌ Invalid choice!")

if __name__ == "__main__":
    main() 