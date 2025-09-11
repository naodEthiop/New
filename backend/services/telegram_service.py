import requests
import time
from typing import Dict, Any, Optional
from firebase_admin import firestore, auth as firebase_auth

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (Application, CommandHandler, ContextTypes, MessageHandler, filters, CallbackQueryHandler)
import logging
import os
import asyncio

class TelegramService:
    """Telegram bot service"""
    
    def __init__(self, config):
        self.bot_token = config.TELEGRAM_BOT_TOKEN
        self.payment_provider_token = config.TELEGRAM_PAYMENT_PROVIDER_TOKEN
    
    def send_message(self, chat_id: str, text: str, parse_mode: str = 'HTML') -> bool:
        """Send a message to a Telegram chat"""
        if not self.bot_token:
            print("TELEGRAM_BOT_TOKEN not set in environment.")
            return False
            
        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        payload = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': parse_mode
        }
        
        try:
            response = requests.post(url, json=payload)
            return response.status_code == 200
        except Exception as e:
            print(f"Failed to send Telegram message: {e}")
            return False
    
    def create_payment_invoice(self, chat_id: str, title: str, description: str, 
                             amount: float, currency: str = 'ETB', payload: str = '') -> Optional[Dict[str, Any]]:
        """Create a Telegram payment invoice"""
        if not self.bot_token or not self.payment_provider_token:
            print("Telegram bot token or payment provider token not set")
            return None
            
        url = f"https://api.telegram.org/bot{self.bot_token}/sendInvoice"
        
        # Convert amount to cents (Telegram requires amounts in cents)
        amount_cents = int(amount * 100)
        
        payload_data = {
            'chat_id': chat_id,
            'title': title,
            'description': description,
            'payload': payload,
            'provider_token': self.payment_provider_token,
            'currency': currency,
            'prices': [{'label': title, 'amount': amount_cents}],
            'start_parameter': f"bingo_{int(time.time())}",
            'need_name': True,
            'need_phone_number': True,
            'need_email': True,
            'send_phone_number_to_provider': True,
            'send_email_to_provider': True,
            'is_flexible': False
        }
        
        try:
            response = requests.post(url, json=payload_data)
            result = response.json()
            
            if result.get('ok'):
                return result['result']
            else:
                print(f"Error creating invoice: {result}")
                return None
                
        except Exception as e:
            print(f"Error creating Telegram payment invoice: {e}")
            return None
    
    def answer_pre_checkout_query(self, query_id: str, ok: bool, error_message: str = None) -> bool:
        """Answer a pre-checkout query"""
        if not self.bot_token:
            return False
            
        url = f"https://api.telegram.org/bot{self.bot_token}/answerPreCheckoutQuery"
        payload = {
            'pre_checkout_query_id': query_id,
            'ok': ok
        }
        
        if not ok and error_message:
            payload['error_message'] = error_message
        
        try:
            response = requests.post(url, json=payload)
            return response.status_code == 200
        except Exception as e:
            print(f"Error answering pre-checkout query: {e}")
            return False
    
    def answer_shipping_query(self, query_id: str, ok: bool, error_message: str = None) -> bool:
        """Answer a shipping query"""
        if not self.bot_token:
            return False
            
        url = f"https://api.telegram.org/bot{self.bot_token}/answerShippingQuery"
        payload = {
            'shipping_query_id': query_id,
            'ok': ok
        }
        
        if not ok and error_message:
            payload['error_message'] = error_message
        
        try:
            response = requests.post(url, json=payload)
            return response.status_code == 200
        except Exception as e:
            print(f"Error answering shipping query: {e}")
            return False
    
    def process_telegram_deposit(self, user_id: str, amount: float, 
                               telegram_payment_charge_id: str, 
                               provider_payment_charge_id: str, db) -> bool:
        """Process Telegram deposit payment"""
        try:
            # Create transaction record
            transaction_data = {
                'userId': user_id,
                'type': 'deposit',
                'amount': amount,
                'currency': 'ETB',
                'status': 'completed',
                'paymentMethod': 'telegram_chapa',
                'metadata': {
                    'telegram_payment_charge_id': telegram_payment_charge_id,
                    'provider_payment_charge_id': provider_payment_charge_id,
                    'source': 'telegram_bot'
                },
                'createdAt': firestore.SERVER_TIMESTAMP
            }
            
            # Add to transactions collection
            db.collection('transactions').add(transaction_data)
            
            # Update wallet balance
            wallet_ref = db.collection('wallets').document(user_id)
            wallet_doc = wallet_ref.get()
            
            if wallet_doc.exists:
                current_balance = wallet_doc.to_dict().get('balance', 0)
                new_balance = current_balance + amount
                wallet_ref.update({
                    'balance': new_balance,
                    'updatedAt': firestore.SERVER_TIMESTAMP
                })
            else:
                # Create wallet if it doesn't exist
                wallet_ref.set({
                    'userId': user_id,
                    'balance': amount,
                    'currency': 'ETB',
                    'status': 'active',
                    'createdAt': firestore.SERVER_TIMESTAMP,
                    'updatedAt': firestore.SERVER_TIMESTAMP
                })
            
            print(f"Processed Telegram deposit: {amount} ETB for user {user_id}")
            return True
            
        except Exception as e:
            print(f"Error processing Telegram deposit: {e}")
            return False
    
    def process_telegram_game_entry(self, user_id: str, game_id: str, amount: float,
                                  telegram_payment_charge_id: str, 
                                  provider_payment_charge_id: str, db) -> bool:
        """Process Telegram game entry payment"""
        try:
            # Create transaction record
            transaction_data = {
                'userId': user_id,
                'type': 'game_entry',
                'amount': amount,
                'currency': 'ETB',
                'status': 'completed',
                'paymentMethod': 'telegram_chapa',
                'gameId': game_id,
                'metadata': {
                    'telegram_payment_charge_id': telegram_payment_charge_id,
                    'provider_payment_charge_id': provider_payment_charge_id,
                    'source': 'telegram_bot'
                },
                'createdAt': firestore.SERVER_TIMESTAMP
            }
            
            # Add to transactions collection
            db.collection('transactions').add(transaction_data)
            
            # Add user to game
            game_ref = db.collection('gameRooms').document(game_id)
            game_doc = game_ref.get()
            
            if game_doc.exists:
                game_data = game_doc.to_dict()
                user_doc = db.collection('users').document(user_id).get()
                user_data = user_doc.to_dict() if user_doc.exists else {}
                
                player_info = {
                    'userId': user_id,
                    'displayName': user_data.get('displayName', 'Player'),
                    'telegramChatId': user_data.get('telegramChatId', ''),
                    'telegramUsername': user_data.get('telegramUsername', ''),
                    'entryPaid': True,
                    'entryAmount': amount
                }
                
                # Add player to game
                game_ref.update({
                    'players': firestore.ArrayUnion([player_info])
                })
                
                print(f"Processed Telegram game entry: {amount} ETB for user {user_id} in game {game_id}")
                return True
            else:
                print(f"Game {game_id} not found")
                return False
                
        except Exception as e:
            print(f"Error processing Telegram game entry: {e}")
            return False 

# Advanced Telegram Bot with multi-language, animated onboarding, wallet, profile, etc.
class AdvancedTelegramBot:
    def __init__(self, token, firebase_manager, supported_languages=None):
        self.token = token
        self.firebase_manager = firebase_manager
        self.supported_languages = supported_languages or {'en': 'English', 'am': 'Amharic'}
        self.application = Application.builder().token(token).build()
        self._setup_handlers()
        self.logger = logging.getLogger('AdvancedTelegramBot')

    def _setup_handlers(self):
        self.application.add_handler(CommandHandler('start', self.start))
        self.application.add_handler(CommandHandler('help', self.help))
        self.application.add_handler(CommandHandler('register', self.register))
        self.application.add_handler(CommandHandler('profile', self.profile))
        self.application.add_handler(CommandHandler('balance', self.balance))
        self.application.add_handler(CommandHandler('wallet', self.wallet))
        self.application.add_handler(CommandHandler('achievements', self.achievements))
        self.application.add_handler(CommandHandler('language', self.language))
        self.application.add_handler(CommandHandler('support', self.support))
        self.application.add_handler(CallbackQueryHandler(self.button))
        self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.text_handler))
        self.application.add_handler(MessageHandler(filters.CONTACT, self.handle_contact))

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        lang = self.get_user_language(user.id)
        welcome_text = self.get_text('welcome', lang).format(name=user.first_name)
        keyboard = [
            [InlineKeyboardButton(self.get_text('profile_btn', lang), callback_data='profile')],
            [InlineKeyboardButton(self.get_text('wallet_btn', lang), callback_data='wallet')],
            [InlineKeyboardButton(self.get_text('achievements_btn', lang), callback_data='achievements')],
            [InlineKeyboardButton(self.get_text('language_btn', lang), callback_data='language')],
            [InlineKeyboardButton(self.get_text('support_btn', lang), callback_data='support')],
        ]
        await update.message.reply_animation(
            animation='https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2Z2b2J6d3F2d3F2d3F2d3F2d3F2d3F2d3F2d3F2d3F2d3F2d3F2/giphy.gif',
            caption=welcome_text,
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

    async def help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        lang = self.get_user_language(update.effective_user.id)
        await update.message.reply_text(self.get_text('help', lang))

    async def register(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        lang = self.get_user_language(user.id)
        
        # Create keyboard with contact request button
        keyboard = [
            [InlineKeyboardButton(
                self.get_text('share_phone', lang), 
                callback_data='request_contact'
            )]
        ]
        
        await update.message.reply_text(
            self.get_text('register_instruction', lang),
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

    async def profile(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        lang = self.get_user_language(user.id)
        db = self.firebase_manager.get_db()
        user_doc = None
        if db:
            users = db.collection('users').where('telegramChatId', '==', user.id).stream()
            for doc in users:
                user_doc = doc
                break
        if user_doc:
            data = user_doc.to_dict()
            profile_text = self.get_text('profile', lang).format(
                name=data.get('displayName', user.first_name),
                level=data.get('level', 1),
                games=data.get('gamesPlayed', 0),
                wins=data.get('gamesWon', 0),
                achievements=len(data.get('achievements', []))
            )
        else:
            profile_text = self.get_text('profile_not_found', lang)
        await update.message.reply_text(profile_text)

    async def balance(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        lang = self.get_user_language(user.id)
        db = self.firebase_manager.get_db()
        wallet_doc = None
        if db:
            wallets = db.collection('wallets').where('telegramChatId', '==', user.id).stream()
            for doc in wallets:
                wallet_doc = doc
                break
        if wallet_doc:
            balance = wallet_doc.to_dict().get('balance', 0)
            await update.message.reply_text(self.get_text('balance', lang).format(balance=balance))
        else:
            await update.message.reply_text(self.get_text('wallet_not_found', lang))

    async def wallet(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await self.balance(update, context)

    async def achievements(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        lang = self.get_user_language(user.id)
        db = self.firebase_manager.get_db()
        user_doc = None
        if db:
            users = db.collection('users').where('telegramChatId', '==', user.id).stream()
            for doc in users:
                user_doc = doc
                break
        if user_doc:
            achievements = user_doc.to_dict().get('achievements', [])
            if achievements:
                text = self.get_text('achievements', lang) + '\n' + '\n'.join(f'- {a}' for a in achievements)
            else:
                text = self.get_text('no_achievements', lang)
        else:
            text = self.get_text('profile_not_found', lang)
        await update.message.reply_text(text)

    async def language(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        lang = self.get_user_language(update.effective_user.id)
        keyboard = [[InlineKeyboardButton(name, callback_data=f'lang_{code}')]
                    for code, name in self.supported_languages.items()]
        await update.message.reply_text(
            self.get_text('choose_language', lang),
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

    async def support(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        lang = self.get_user_language(update.effective_user.id)
        await update.message.reply_text(self.get_text('support', lang))

    async def button(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        query = update.callback_query
        await query.answer()
        data = query.data
        
        if data == 'profile':
            await self.profile(update, context)
        elif data == 'wallet':
            await self.wallet(update, context)
        elif data == 'achievements':
            await self.achievements(update, context)
        elif data == 'language':
            await self.language(update, context)
        elif data == 'support':
            await self.support(update, context)
        elif data == 'request_contact':
            # Send contact request
            keyboard = [[InlineKeyboardButton(
                self.get_text('share_phone', self.get_user_language(query.from_user.id)), 
                request_contact=True
            )]]
            await query.edit_message_text(
                self.get_text('share_phone_prompt', self.get_user_language(query.from_user.id)),
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
        elif data.startswith('lang_'):
            lang_code = data.split('_', 1)[1]
            self.set_user_language(update.effective_user.id, lang_code)
            await query.edit_message_text(self.get_text('language_set', lang_code))

    async def text_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        # Fallback for unknown text
        lang = self.get_user_language(update.effective_user.id)
        await update.message.reply_text(self.get_text('unknown_command', lang))

    async def handle_contact(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        contact = update.message.contact
        lang = self.get_user_language(user.id)
        
        if contact and contact.user_id == user.id:
            # Store phone number in database
            db = self.firebase_manager.get_db()
            if db:
                # Check if user exists
                users = db.collection('users').where('telegramChatId', '==', user.id).stream()
                user_doc = None
                for doc in users:
                    user_doc = doc
                    break
                
                if user_doc:
                    # Update existing user with phone number
                    db.collection('users').document(user_doc.id).update({
                        'phoneNumber': contact.phone_number,
                        'phoneRegistered': True,
                        'phoneRegisteredAt': firestore.SERVER_TIMESTAMP
                    })
                else:
                    # Create new user with phone number
                    new_user = db.collection('users').document()
                    new_user.set({
                        'telegramChatId': user.id,
                        'telegramUsername': user.username,
                        'displayName': f"{user.first_name} {user.last_name or ''}".strip(),
                        'phoneNumber': contact.phone_number,
                        'phoneRegistered': True,
                        'phoneRegisteredAt': firestore.SERVER_TIMESTAMP,
                        'isAdmin': False,
                        'isBotOwner': False,
                        'balance': 0,
                        'level': 1,
                        'experience': 0,
                        'gamesPlayed': 0,
                        'gamesWon': 0,
                        'totalEarnings': 0,
                        'achievements': [],
                        'badges': [],
                        'createdAt': firestore.SERVER_TIMESTAMP,
                        'lastLoginAt': firestore.SERVER_TIMESTAMP,
                        'settings': {
                            'soundEnabled': True,
                            'musicEnabled': True,
                            'notificationsEnabled': True,
                            'language': lang,
                            'theme': 'dark'
                        },
                        'tutorial': {
                            'completed': False,
                            'currentStep': 0,
                            'steps': {
                                'welcome': False,
                                'createGame': False,
                                'joinGame': False,
                                'playGame': False,
                                'wallet': False,
                                'settings': False
                            }
                        }
                    })
                
                await update.message.reply_text(self.get_text('phone_registered_success', lang))
            else:
                await update.message.reply_text(self.get_text('database_error', lang))
        else:
            await update.message.reply_text(self.get_text('invalid_contact', lang))

    def get_user_language(self, user_id):
        # TODO: Store/retrieve user language from DB or cache
        return 'en'

    def set_user_language(self, user_id, lang_code):
        # TODO: Store user language in DB or cache
        pass

    def get_text(self, key, lang):
        texts = {
            'welcome': {
                'en': '👋 Welcome, {name}!\nThis is the Bingo Game Bot. Use the menu below to get started.',
                'am': '👋 እንኳን ደህና መጡ {name}! ይህ የቢንጎ ጨዋታ ቦት ነው። ለመጀመር ዝርዝሩን ይጠቀሙ።'
            },
            'profile_btn': {'en': '👤 Profile', 'am': '👤 መገለጫ'},
            'wallet_btn': {'en': '💰 Wallet', 'am': '💰 ቦሌት'},
            'achievements_btn': {'en': '🏆 Achievements', 'am': '🏆 ሽልማቶች'},
            'language_btn': {'en': '🌐 Language', 'am': '🌐 ቋንቋ'},
            'support_btn': {'en': '🆘 Support', 'am': '🆘 ድጋፍ'},
            'help': {
                'en': 'Use the menu or type /profile, /wallet, /achievements, /language, /support, /register.',
                'am': 'ዝርዝሩን ይጠቀሙ ወይም /profile, /wallet, /achievements, /language, /support, /register ይተይቡ።'
            },
            'register_instruction': {
                'en': '📱 To register your phone number, please share your contact information. This helps us verify your account and provide better service.',
                'am': '📱 የስልክ ቁጥርዎን ለመመዝገብ እባክዎን የእርስዎን አድራሻ ያጋሩ። ይህ መለያዎን ለመረጋገጥ እና የተሻለ አገልግሎት ለመስጠት ያገለግለናል።'
            },
            'share_phone': {
                'en': '📱 Share Phone Number',
                'am': '📱 የስልክ ቁጥር ያጋሩ'
            },
            'share_phone_prompt': {
                'en': '📱 Please tap the button below to share your phone number:',
                'am': '📱 የስልክ ቁጥርዎን ለመጋራት እባክዎን ከታች ያለውን ቁልፍ ይጫኑ:'
            },
            'phone_registered_success': {
                'en': '✅ Phone number registered successfully! You can now use all bot features.',
                'am': '✅ የስልክ ቁጥር በተሳካት ሁኔታ ተመዝግቧል! አሁን ሁሉንም የቦት ባህሪያት መጠቀም ይችላሉ።'
            },
            'invalid_contact': {
                'en': '❌ Invalid contact. Please share your own phone number.',
                'am': '❌ የማያገለግል አድራሻ። እባክዎን የራስዎን የስልክ ቁጥር ያጋሩ።'
            },
            'database_error': {
                'en': '❌ Database error. Please try again later.',
                'am': '❌ የዳታቤዝ ስህተት። እባክዎን በኋላ ዳግም ይሞክሩ።'
            },
            'profile': {
                'en': '👤 Name: {name}\nLevel: {level}\nGames: {games}\nWins: {wins}\nAchievements: {achievements}',
                'am': '👤 ስም: {name}\nደረጃ: {level}\nጨዋታዎች: {games}\nአሸናፊዎች: {wins}\nሽልማቶች: {achievements}'
            },
            'profile_not_found': {'en': 'Profile not found. Please register on the web app.', 'am': 'መገለጫ አልተገኘም። እባክዎን በድህረ ገጹ ይመዝገቡ።'},
            'balance': {'en': '💰 Your wallet balance: {balance} ETB', 'am': '💰 የእርስዎ ቦሌት ሂሳብ: {balance} ብር'},
            'wallet_not_found': {'en': 'No wallet found. Please register on the web app.', 'am': 'ቦሌት አልተገኘም። እባክዎን በድህረ ገጹ ይመዝገቡ።'},
            'achievements': {'en': '🏆 Your Achievements:', 'am': '🏆 የእርስዎ ሽልማቶች:'},
            'no_achievements': {'en': 'No achievements yet.', 'am': 'ምንም ሽልማት የለም።'},
            'choose_language': {'en': 'Choose your language:', 'am': 'ቋንቋዎን ይምረጡ።'},
            'language_set': {'en': 'Language updated!', 'am': 'ቋንቋ ተቀይሯል!'},
            'support': {'en': 'For support, contact @YourSupportUsername.', 'am': 'ለድጋፍ እባክዎን @YourSupportUsername ያነጋግሩ።'},
            'unknown_command': {'en': 'Unknown command. Use the menu or /help.', 'am': 'ያልታወቀ ትእዛዝ። ዝርዝሩን ይጠቀሙ ወይም /help ይተይቡ።'}
        }
        return texts.get(key, {}).get(lang, texts.get(key, {}).get('en', '')) 