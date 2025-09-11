#!/usr/bin/env python3
"""
Advanced Telegram Bot Runner
This module runs the advanced Telegram bot with multi-language support,
phone registration, and all advanced features.
"""

import asyncio
import logging
import os
from dotenv import load_dotenv
from services.telegram_service import AdvancedTelegramBot
from database.firebase import firebase_manager
from config.settings import get_config

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

logger = logging.getLogger(__name__)

def run_bot_polling():
    """Run the bot using polling (for development)"""
    try:
        # Get configuration
        config = get_config()
        
        if not config.TELEGRAM_BOT_TOKEN:
            logger.error("TELEGRAM_BOT_TOKEN not found in environment variables")
            return
        
        # Initialize Firebase
        firebase_manager.initialize(config)
        
        # Create and run advanced bot
        bot = AdvancedTelegramBot(
            token=config.TELEGRAM_BOT_TOKEN,
            firebase_manager=firebase_manager,
            supported_languages={'en': 'English', 'am': 'Amharic'}
        )
        
        logger.info("Starting Advanced Telegram Bot with polling...")
        logger.info(f"Bot token: {config.TELEGRAM_BOT_TOKEN[:10]}...")
        logger.info("Supported languages: English, Amharic")
        
        # Run the bot
        bot.run_polling()
        
    except Exception as e:
        logger.error(f"Error running bot: {e}")
        raise

def run_bot_webhook(webhook_url: str, port: int = 8443):
    """Run the bot using webhook (for production)"""
    try:
        # Get configuration
        config = get_config()
        
        if not config.TELEGRAM_BOT_TOKEN:
            logger.error("TELEGRAM_BOT_TOKEN not found in environment variables")
            return
        
        # Initialize Firebase
        firebase_manager.initialize(config)
        
        # Create and run advanced bot
        bot = AdvancedTelegramBot(
            token=config.TELEGRAM_BOT_TOKEN,
            firebase_manager=firebase_manager,
            supported_languages={'en': 'English', 'am': 'Amharic'}
        )
        
        logger.info("Starting Advanced Telegram Bot with webhook...")
        logger.info(f"Webhook URL: {webhook_url}")
        logger.info(f"Port: {port}")
        logger.info("Supported languages: English, Amharic")
        
        # Run the bot with webhook
        bot.run_webhook(webhook_url=webhook_url, port=port)
        
    except Exception as e:
        logger.error(f"Error running bot: {e}")
        raise

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        mode = sys.argv[1]
        
        if mode == "webhook":
            if len(sys.argv) < 3:
                print("Usage: python advanced_bot_runner.py webhook <webhook_url> [port]")
                sys.exit(1)
            
            webhook_url = sys.argv[2]
            port = int(sys.argv[3]) if len(sys.argv) > 3 else 8443
            
            run_bot_webhook(webhook_url, port)
        else:
            print("Unknown mode. Use 'polling' or 'webhook'")
            sys.exit(1)
    else:
        # Default to polling
        run_bot_polling() 