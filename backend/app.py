from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import requests
from firebase_admin import firestore, auth as firebase_auth

# Import our modules
from config.settings import get_config
from database.firebase import firebase_manager
from services.chapa_service import ChapaService
from services.telegram_service import TelegramService, AdvancedTelegramBot
from routes.payment_routes import payment_bp
from routes.telegram_routes import telegram_bp

# Initialize Flask app
app = Flask(__name__)

# Load configuration
config = get_config()
app.config.from_object(config)

# Initialize CORS
CORS(app, origins=config.CORS_ORIGINS, 
     allow_headers=['Content-Type', 'Authorization'], 
     supports_credentials=True)

# Initialize Firebase
firebase_manager.initialize(config)

# Initialize services
chapa_service = ChapaService(config)
telegram_service = TelegramService(config)

# Initialize Advanced Telegram Bot (optional)
advanced_bot = None
if config.TELEGRAM_BOT_TOKEN:
    try:
        advanced_bot = AdvancedTelegramBot(
            token=config.TELEGRAM_BOT_TOKEN,
            firebase_manager=firebase_manager,
            supported_languages={'en': 'English', 'am': 'Amharic'}
        )
        print("Advanced Telegram Bot initialized successfully")
    except Exception as e:
        print(f"Failed to initialize Advanced Telegram Bot: {e}")
        advanced_bot = None

# Register blueprints
app.register_blueprint(payment_bp)
app.register_blueprint(telegram_bp)

# Print startup information
print(f"Environment: {config.ENVIRONMENT}")
print(f"Chapa Secret Key configured: {'Yes' if config.CHAPA_SECRET_KEY else 'No'}")
print(f"Using Chapa Base URL: {config.CHAPA_BASE_URL}")
print(f"Frontend URL: {config.FRONTEND_URL}")
print(f"Callback Base URL: {config.CALLBACK_BASE_URL}")
print(f"Telegram Bot Token configured: {'Yes' if config.TELEGRAM_BOT_TOKEN else 'No'}")

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "environment": config.ENVIRONMENT,
        "chapa_configured": bool(config.CHAPA_SECRET_KEY),
        "firebase_configured": firebase_manager.is_initialized(),
        "telegram_configured": bool(config.TELEGRAM_BOT_TOKEN),
        "timestamp": time.time()
    }), 200

# Test endpoint
@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({
        "message": "API is working!",
        "environment": config.ENVIRONMENT,
        "timestamp": time.time()
    }), 200

# Root endpoint
@app.route('/', methods=['GET'])
def root():
        return jsonify({
        "message": "Bingo Backend API",
        "version": "2.0.0",
        "environment": config.ENVIRONMENT,
        "endpoints": {
            "health": "/health",
            "test": "/api/test",
            "payments": "/api/create-payment",
            "telegram": "/api/telegram/webhook",
            "advanced_bot": "/api/advanced-bot/start"
        },
        "advanced_bot_available": advanced_bot is not None
    }), 200

# Advanced Bot Management
@app.route('/api/advanced-bot/start', methods=['POST'])
def start_advanced_bot():
    """Start the advanced Telegram bot"""
    if not advanced_bot:
        return jsonify({
            "error": "Advanced bot not available. Check TELEGRAM_BOT_TOKEN configuration."
        }), 400
    
    try:
        # Start the bot in a separate thread
        import threading
        bot_thread = threading.Thread(target=advanced_bot.run_polling, daemon=True)
        bot_thread.start()
        
        return jsonify({
            "message": "Advanced Telegram Bot started successfully",
            "status": "running"
        }), 200
    except Exception as e:
        return jsonify({
            "error": f"Failed to start advanced bot: {str(e)}"
        }), 500

@app.route('/api/advanced-bot/status', methods=['GET'])
def advanced_bot_status():
    """Get the status of the advanced bot"""
    return jsonify({
        "available": advanced_bot is not None,
        "status": "running" if advanced_bot else "not_available"
    }), 200

# Telegram webhook handlers (these need access to services)
def handle_telegram_update(update):
    """Handle Telegram update"""
    if 'message' in update:
        message = update['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')
        telegram_username = message['from'].get('username', '')

        db = firebase_manager.get_db()
        if not db:
            return

        # Try to find user by Telegram chat ID
        user_ref = None
        user_doc = None
        user_id = None
        users = db.collection('users').where('telegramChatId', '==', chat_id).stream()
        for doc in users:
            user_doc = doc
            user_id = doc.id
            break

        # If not found by chat ID, try to link by username
        if not user_id and telegram_username:
            users_by_username = db.collection('users').where('telegramUsername', '==', telegram_username).stream()
            for doc in users_by_username:
                user_doc = doc
                user_id = doc.id
                # Link this Telegram chat ID to the user
                db.collection('users').document(user_id).update({
                    'telegramChatId': chat_id,
                    'telegramUsername': telegram_username
                })
                telegram_service.send_message(chat_id, f"Your Telegram account has been linked to Bingo user {user_doc.to_dict().get('displayName', 'Player')}! You can now use all bot features.")
                break

        if text.startswith('/start'):
            if not user_id:
                telegram_service.send_message(chat_id, "Welcome to Bingo Game! Please link your Telegram in your web profile to use all features. Use /help for more.")
            else:
                # Try to find a waiting game
                waiting_games = db.collection('gameRooms').where('status', '==', 'waiting').limit(1).stream()
                game_id = None
                for game in waiting_games:
                    game_id = game.id
                    break
                if not game_id:
                    # No waiting game, create a new one
                    new_game = db.collection('gameRooms').document()
                    new_game.set({
                        'name': f"{user_doc.to_dict().get('displayName', 'Player')}'s Game",
                        'status': 'waiting',
                        'players': [{
                            'userId': user_id,
                            'displayName': user_doc.to_dict().get('displayName', 'Player'),
                            'telegramChatId': chat_id,
                            'telegramUsername': telegram_username
                        }],
                        'createdAt': firestore.SERVER_TIMESTAMP,
                        'entryFee': 0,
                        'maxPlayers': 10
                    })
                    game_id = new_game.id
                else:
                    # Add user to the waiting game
                    game_ref = db.collection('gameRooms').document(game_id)
                    game_ref.update({
                        'players': firestore.ArrayUnion([{
                            'userId': user_id,
                            'displayName': user_doc.to_dict().get('displayName', 'Player'),
                            'telegramChatId': chat_id,
                            'telegramUsername': telegram_username
                        }])
                    })
                # Send the user a link to the game
                game_url = f"https://bingo-game-39ba5.web.app/game/{game_id}"
                telegram_service.send_message(chat_id, f"Welcome! Your game is ready. Click here to play: {game_url}")
        elif text.startswith('/help'):
            telegram_service.send_message(chat_id, "Available commands:\n/start - Welcome\n/join <game_id> - Join a game\n/balance - Show your wallet balance\n/deposit <amount> - Deposit money\n/games - List active games\n/help - Show this help message")
        elif text.startswith('/balance'):
            if not user_id:
                telegram_service.send_message(chat_id, "Your Telegram is not linked to a Bingo account. Please link it in your web profile.")
            else:
                wallet_ref = db.collection('wallets').document(user_id)
                wallet_doc = wallet_ref.get()
                if wallet_doc.exists:
                    balance = wallet_doc.to_dict().get('balance', 0)
                    telegram_service.send_message(chat_id, f"Your wallet balance: {balance} ETB")
                else:
                    telegram_service.send_message(chat_id, "No wallet found for your account.")
        elif text.startswith('/deposit'):
            parts = text.split()
            if len(parts) == 2:
                try:
                    amount = float(parts[1])
                    if amount <= 0:
                        telegram_service.send_message(chat_id, "Amount must be greater than 0.")
                        return
                    
                    # Create payment invoice
                    payload = f"deposit|{amount}"
                    invoice = telegram_service.create_payment_invoice(
                        chat_id=chat_id,
                        title="Bingo Wallet Deposit",
                        description=f"Deposit {amount} ETB to your Bingo wallet",
                        amount=amount,
                        currency='ETB',
                        payload=payload
                    )
                    
                    if invoice:
                        telegram_service.send_message(chat_id, f"💳 Payment invoice created for {amount} ETB. Please complete the payment to add funds to your wallet.")
                    else:
                        telegram_service.send_message(chat_id, "❌ Failed to create payment invoice. Please try again later.")
                        
                except ValueError:
                    telegram_service.send_message(chat_id, "Invalid amount. Please use a number (e.g., /deposit 100)")
            else:
                telegram_service.send_message(chat_id, "Usage: /deposit <amount> (e.g., /deposit 100)")
        elif text.startswith('/join'):
            parts = text.split()
            if len(parts) == 2:
                game_id = parts[1]
                if not user_id:
                    telegram_service.send_message(chat_id, "Your Telegram is not linked to a Bingo account. Please link it in your web profile.")
                else:
                    # Check if game exists and has entry fee
                    game_ref = db.collection('gameRooms').document(game_id)
                    game_doc = game_ref.get()
                    if not game_doc.exists:
                        telegram_service.send_message(chat_id, f"Game {game_id} not found.")
                    else:
                        game_data = game_doc.to_dict()
                        entry_fee = game_data.get('entryFee', 0)
                        
                        if entry_fee > 0:
                            # Create payment invoice for game entry
                            payload = f"game_entry|{game_id}|{entry_fee}"
                            invoice = telegram_service.create_payment_invoice(
                                chat_id=chat_id,
                                title=f"Game Entry: {game_data.get('name', 'Bingo Game')}",
                                description=f"Entry fee for {game_data.get('name', 'Bingo Game')}",
                                amount=entry_fee,
                                currency='ETB',
                                payload=payload
                            )
                            
                            if invoice:
                                telegram_service.send_message(chat_id, f"💳 Payment invoice created for game entry ({entry_fee} ETB). Please complete the payment to join the game.")
                            else:
                                telegram_service.send_message(chat_id, "❌ Failed to create payment invoice. Please try again later.")
                        else:
                            # Free game, add user directly
                            player_info = {
                                'userId': user_id,
                                'displayName': user_doc.to_dict().get('displayName', 'Player'),
                                'telegramChatId': chat_id,
                                'telegramUsername': telegram_username
                            }
                            # Add player to game
                            game_ref.update({
                                'players': firestore.ArrayUnion([player_info])
                            })
                            telegram_service.send_message(chat_id, f"You have joined game {game_id}!")
            else:
                telegram_service.send_message(chat_id, "Usage: /join <game_id>")
        else:
            telegram_service.send_message(chat_id, "Unknown command. Use /help.")

def handle_pre_checkout_query(pre_checkout_query):
    """Handle pre-checkout queries from Telegram payments"""
    try:
        query_id = pre_checkout_query['id']
        user_id = pre_checkout_query['from']['id']
        currency = pre_checkout_query['currency']
        total_amount = pre_checkout_query['total_amount'] / 100  # Convert from cents
        invoice_payload = pre_checkout_query.get('invoice_payload', '')
        
        print(f"Pre-checkout query: {query_id}, Amount: {total_amount} {currency}")
        
        # Validate the payment
        # You can add additional validation here (e.g., check user balance, game availability)
        
        # Approve the pre-checkout query
        telegram_service.answer_pre_checkout_query(query_id, True)
        
        return jsonify({'status': 'ok'})
    except Exception as e:
        print(f"Error handling pre-checkout query: {e}")
        # Reject the pre-checkout query
        telegram_service.answer_pre_checkout_query(query_id, False, 'Payment validation failed')
        return jsonify({'error': str(e)}), 500

def handle_successful_payment(successful_payment, message):
    """Handle successful payments from Telegram"""
    try:
        user_id = message['from']['id']
        chat_id = message['chat']['id']
        currency = successful_payment['currency']
        total_amount = successful_payment['total_amount'] / 100  # Convert from cents
        invoice_payload = successful_payment.get('invoice_payload', '')
        telegram_payment_charge_id = successful_payment['telegram_payment_charge_id']
        provider_payment_charge_id = successful_payment.get('provider_payment_charge_id', '')
        
        print(f"Successful payment: {total_amount} {currency} from user {user_id}")
        print(f"Payment charge ID: {telegram_payment_charge_id}")
        print(f"Provider charge ID: {provider_payment_charge_id}")
        print(f"Invoice payload: {invoice_payload}")
        
        # Parse invoice payload to determine payment type
        payment_type = 'deposit'  # default
        game_id = None
        amount = total_amount
        
        if invoice_payload:
            try:
                payload_data = invoice_payload.split('|')
                if len(payload_data) >= 2:
                    payment_type = payload_data[0]
                    if payment_type == 'game_entry' and len(payload_data) >= 3:
                        game_id = payload_data[1]
                        amount = float(payload_data[2])
                    elif payment_type == 'deposit':
                        amount = float(payload_data[1]) if len(payload_data) > 1 else total_amount
            except Exception as e:
                print(f"Error parsing invoice payload: {e}")
        
        db = firebase_manager.get_db()
        if not db:
            return jsonify({'error': 'Database unavailable'}), 500
        
        # Find user by Telegram chat ID
        user_doc = None
        firebase_user_id = None
        users = db.collection('users').where('telegramChatId', '==', str(user_id)).stream()
        for doc in users:
            user_doc = doc
            firebase_user_id = doc.id
            break

        if not firebase_user_id:
            # Try to find by username
            telegram_username = message['from'].get('username', '')
            if telegram_username:
                users_by_username = db.collection('users').where('telegramUsername', '==', telegram_username).stream()
                for doc in users_by_username:
                    user_doc = doc
                    firebase_user_id = doc.id
                    # Link this Telegram chat ID
                    db.collection('users').document(firebase_user_id).update({
                        'telegramChatId': str(user_id)
                    })
                    break

        if not firebase_user_id:
            # Create new user if not found
            try:
                user_record = firebase_auth.create_user(
                    display_name=message['from'].get('first_name', '') + ' ' + message['from'].get('last_name', ''),
                    uid=f"tg_{user_id}"
                )
                firebase_user_id = user_record.uid
                db.collection('users').document(firebase_user_id).set({
                    'displayName': user_record.display_name,
                    'telegramChatId': str(user_id),
                    'telegramUsername': message['from'].get('username', ''),
                    'createdAt': firestore.SERVER_TIMESTAMP,
                    'updatedAt': firestore.SERVER_TIMESTAMP
                })
            except Exception as e:
                print(f"Error creating user: {e}")
                # Try to get existing user
                try:
                    user_record = firebase_auth.get_user(f"tg_{user_id}")
                    firebase_user_id = user_record.uid
                except Exception as ex:
                    print(f"Could not create or find user for Telegram ID: {user_id}")
                    return jsonify({'error': 'User not found'}), 404

        # Process the payment based on type
        success = False
        if payment_type == 'deposit':
            success = telegram_service.process_telegram_deposit(
                firebase_user_id, amount, telegram_payment_charge_id, provider_payment_charge_id, db
            )
        elif payment_type == 'game_entry':
            success = telegram_service.process_telegram_game_entry(
                firebase_user_id, game_id, amount, telegram_payment_charge_id, provider_payment_charge_id, db
            )

        if success:
            # Send confirmation message
            telegram_service.send_message(chat_id, f"✅ Payment successful! {amount} {currency} has been processed.")

        return jsonify({'status': 'ok'})
    except Exception as e:
        print(f"Error handling successful payment: {e}")
        return jsonify({'error': str(e)}), 500

def handle_shipping_query(shipping_query):
    """Handle shipping queries (not needed for digital products)"""
    try:
        query_id = shipping_query['id']
        telegram_service.answer_shipping_query(
            query_id, False, 'Shipping not available for digital products'
        )
        return jsonify({'status': 'ok'})
    except Exception as e:
        print(f"Error handling shipping query: {e}")
        return jsonify({'error': str(e)}), 500

# Update the route handlers to use the new functions
@app.route('/api/telegram/webhook', methods=['POST'])
def telegram_webhook():
    update = request.json
    handle_telegram_update(update)
    return jsonify({'status': 'ok'})

@app.route('/api/telegram/payment-webhook', methods=['POST'])
def telegram_payment_webhook():
    """Handle Telegram payment webhooks from BotFather Chapa integration"""
    try:
        data = request.json
        print(f"Received Telegram payment webhook: {data}")
        
        # Handle different types of payment updates
        if 'pre_checkout_query' in data:
            return handle_pre_checkout_query(data['pre_checkout_query'])
        elif 'successful_payment' in data:
            return handle_successful_payment(data['successful_payment'], data.get('message', {}))
        elif 'shipping_query' in data:
            return handle_shipping_query(data['shipping_query'])
        
        return jsonify({'status': 'ok'})
    except Exception as e:
        print(f"Error in Telegram payment webhook: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=config.DEBUG) 