#!/usr/bin/env python3
"""
Simple script to run the Advanced Telegram Bot
Usage: python run_advanced_bot.py
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from advanced_bot_runner import run_bot_polling

if __name__ == "__main__":
    print("🚀 Starting Advanced Telegram Bot...")
    print("📱 Features: Multi-language, Phone Registration, Profile, Wallet, Achievements")
    print("🌐 Languages: English, Amharic")
    print("⚡ Mode: Polling (Development)")
    print("-" * 50)
    
    try:
        run_bot_polling()
    except KeyboardInterrupt:
        print("\n🛑 Bot stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1) 