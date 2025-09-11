from flask import Blueprint, request, jsonify
from functools import wraps
from firebase_admin import auth as firebase_auth, firestore
from services.telegram_service import TelegramService
from database.firebase import firebase_manager

telegram_bp = Blueprint('telegram', __name__, url_prefix='/api/telegram')

def require_auth(f):
    """Authentication decorator"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
        id_token = auth_header.split('Bearer ')[-1]
        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            request.user = decoded_token
        except Exception as e:
            return jsonify({'error': f'Invalid or expired token: {str(e)}'}), 401
        return f(*args, **kwargs)
    return decorated

@telegram_bp.route('/webhook', methods=['POST'])
def telegram_webhook():
    """Handle Telegram webhook updates"""
    update = request.json
    handle_telegram_update(update)
    return jsonify({'status': 'ok'})

@telegram_bp.route('/payment-webhook', methods=['POST'])
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

@telegram_bp.route('/login', methods=['POST'])
def telegram_login():
    """Handle Telegram login"""
    data = request.get_json()
    telegram_id = str(data.get('telegram_id'))
    username = data.get('username')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    
    if not telegram_id:
        return jsonify({'error': 'Missing telegram_id'}), 400
    
    db = firebase_manager.get_db()
    if not db:
        return jsonify({'error': 'Database unavailable'}), 500
    
    # Try to find user by telegramChatId
    users = db.collection('users').where('telegramChatId', '==', telegram_id).stream()
    user_doc = None
    user_id = None
    
    for doc in users:
        user_doc = doc
        user_id = doc.id
        break
    
    if not user_id:
        # Create a new user in Firebase Auth and Firestore
        try:
            user_record = firebase_auth.create_user(
                display_name=f"{first_name or ''} {last_name or ''}".strip() or username or f"tg_{telegram_id}",
                uid=f"tg_{telegram_id}"
            )
        except Exception:
            # User may already exist in Auth
            user_record = firebase_auth.get_user(f"tg_{telegram_id}")
        
        user_id = user_record.uid
        db.collection('users').document(user_id).set({
            'displayName': user_record.display_name,
            'telegramChatId': telegram_id,
            'telegramUsername': username,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        }, merge=True)
    
    # Create a Firebase custom token
    custom_token = firebase_auth.create_custom_token(user_id)
    return jsonify({'token': custom_token.decode() if hasattr(custom_token, 'decode') else custom_token})

@telegram_bp.route('/user/telegram-chat-id', methods=['GET'])
@require_auth
def get_telegram_chat_id():
    """Get user's Telegram chat ID"""
    try:
        user_id = request.user['uid']
        db = firebase_manager.get_db()
        
        if not db:
            return jsonify({'error': 'Database unavailable'}), 500
            
        user_doc = db.collection('users').document(user_id).get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            chat_id = user_data.get('telegramChatId')
            
            if chat_id:
                return jsonify({'chatId': chat_id})
            else:
                return jsonify({'chatId': None})
        else:
            return jsonify({'chatId': None})
            
    except Exception as e:
        print(f"Error getting Telegram chat ID: {e}")
        return jsonify({'error': str(e)}), 500

def handle_telegram_update(update):
    """Handle Telegram update"""
    # This function will be implemented in the main app
    # It's moved here for modularity but needs access to services
    pass

def handle_pre_checkout_query(pre_checkout_query):
    """Handle pre-checkout queries from Telegram payments"""
    # This function will be implemented in the main app
    pass

def handle_successful_payment(successful_payment, message):
    """Handle successful payments from Telegram"""
    # This function will be implemented in the main app
    pass

def handle_shipping_query(shipping_query):
    """Handle shipping queries (not needed for digital products)"""
    # This function will be implemented in the main app
    pass 