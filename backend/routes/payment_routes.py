from flask import Blueprint, request, jsonify
from functools import wraps
from firebase_admin import auth as firebase_auth
from services.chapa_service import ChapaService
from database.firebase import firebase_manager

payment_bp = Blueprint('payment', __name__, url_prefix='/api')

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

@payment_bp.route('/payment/initiate', methods=['POST'])
@require_auth
def initiate_payment():
    """Initialize a new Chapa payment"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Validate required fields
        required_fields = ['amount', 'email', 'first_name', 'tx_ref']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Validate amount
        try:
            amount = float(data['amount'])
            if amount < 10:
                return jsonify({"error": "Minimum payment amount is 10 ETB"}), 400
            if amount > 50000:
                return jsonify({"error": "Maximum payment amount is 50,000 ETB"}), 400
        except ValueError:
            return jsonify({"error": "Invalid amount format"}), 400
        
        # Validate email
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            return jsonify({"error": "Invalid email format"}), 400
        
        # Get user info
        user_id = request.user['uid']
        user_email = request.user.get('email', data['email'])
        
        # Add user info to payment data
        payment_data = {
            'amount': amount,
            'email': data['email'],
            'first_name': data['first_name'],
            'last_name': data.get('last_name', 'Player'),
            'phone': data.get('phone', ''),
            'currency': data.get('currency', 'ETB'),
            'tx_ref': data['tx_ref'],
            'callback_url': data.get('callback_url'),
            'return_url': data.get('return_url'),
            'customization': data.get('customization', {}),
            'metadata': {
                'user_id': user_id,
                'user_email': user_email,
                **data.get('metadata', {})
            }
        }
        
        # Initialize Chapa service
        from config.settings import get_config
        config = get_config()
        chapa_service = ChapaService(config)
        
        # Create payment
        result = chapa_service.create_payment(payment_data)
        
        if result.get('status') == 'success':
            # Log payment initiation
            print(f"Payment initiated: {data['tx_ref']} for user {user_id}, amount: {amount} ETB")
            
            return jsonify({
                "status": "success",
                "message": "Payment initialized successfully",
                "data": result.get('data', {})
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": result.get('message', 'Payment initialization failed'),
                "error": result.get('error')
            }), 400
            
    except Exception as e:
        print(f"Payment initiation error: {e}")
        return jsonify({
            "status": "error",
            "message": "Payment initialization failed",
            "error": str(e)
        }), 500

@payment_bp.route('/wallet/deposit', methods=['POST'])
@require_auth
def wallet_deposit():
    """Process wallet deposit"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        amount = data.get('amount')
        email = data.get('email')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        user_id = request.user['uid']
        phone = data.get('phone')

        print(f"Received deposit request: {data}")

        # Validate required fields
        if not all([amount, email, first_name, user_id, phone]):
            missing_fields = [field for field, value in [
                ('amount', amount), ('email', email), ('first_name', first_name),
                ('userId', user_id), ('phone', phone)
            ] if not value]
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400
        
        # Provide default for last_name if empty
        if not last_name:
            last_name = "Player"

        # Validate amount
        try:
            amount = float(amount)
            if amount < 10:
                return jsonify({'error': 'Minimum deposit amount is 10 ETB'}), 400
            if amount > 50000:
                return jsonify({'error': 'Maximum deposit amount is 50,000 ETB'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid amount format'}), 400

        # Create payment
        deposit_payload = {
            'amount': amount,
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone
        }

        # Initialize Chapa service (you'll need to pass config)
        from config.settings import get_config
        config = get_config()
        chapa_service = ChapaService(config)
        result = chapa_service.create_payment(deposit_payload)

        return jsonify(result)

    except Exception as e:
        print(f"Deposit error: {e}")
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/payment-callback', methods=['POST', 'GET'])
def payment_callback():
    """Handle Chapa payment callback"""
    try:
        if request.method == 'GET':
            # Handle GET request (usually for testing)
            return jsonify({"message": "Payment callback endpoint is working"}), 200
        
        # Handle POST request with payment verification
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400
        
        print(f"Payment callback received: {data}")
        
        # Extract transaction reference
        tx_ref = data.get('tx_ref')
        if not tx_ref:
            return jsonify({"error": "Missing transaction reference"}), 400
        
        # Verify payment with Chapa
        from config.settings import get_config
        config = get_config()
        chapa_service = ChapaService(config)
        
        verification_result = chapa_service.verify_payment(tx_ref)
        
        if verification_result.get('status') == 'success':
            # Payment is successful, update user wallet
            payment_data = verification_result.get('data', {})
            amount = payment_data.get('amount', 0)
            user_id = payment_data.get('metadata', {}).get('user_id')
            
            if user_id and amount > 0:
                # Update user wallet in Firebase
                try:
                    db = firebase_manager.get_db()
                    user_ref = db.collection('users').document(user_id)
                    
                    # Get current wallet balance
                    user_doc = user_ref.get()
                    if user_doc.exists:
                        current_balance = user_doc.to_dict().get('wallet_balance', 0)
                        new_balance = current_balance + amount
                        
                        # Update wallet balance
                        user_ref.update({
                            'wallet_balance': new_balance,
                            'last_updated': firebase_manager.get_timestamp()
                        })
                        
                        # Log transaction
                        transaction_ref = db.collection('transactions').document()
                        transaction_ref.set({
                            'user_id': user_id,
                            'type': 'deposit',
                            'amount': amount,
                            'currency': 'ETB',
                            'tx_ref': tx_ref,
                            'status': 'completed',
                            'created_at': firebase_manager.get_timestamp(),
                            'payment_method': 'chapa',
                            'description': f'Wallet deposit via Chapa'
                        })
                        
                        print(f"Payment completed: {tx_ref}, user {user_id}, amount: {amount} ETB")
                        
                        return jsonify({
                            "status": "success",
                            "message": "Payment processed successfully"
                        }), 200
                    else:
                        print(f"User not found: {user_id}")
                        return jsonify({"error": "User not found"}), 404
                        
                except Exception as e:
                    print(f"Error updating user wallet: {e}")
                    return jsonify({"error": "Failed to update user wallet"}), 500
            else:
                print(f"Invalid payment data: {payment_data}")
                return jsonify({"error": "Invalid payment data"}), 400
        else:
            print(f"Payment verification failed: {verification_result}")
            return jsonify({
                "status": "error",
                "message": "Payment verification failed"
            }), 400
            
    except Exception as e:
        print(f"Payment callback error: {e}")
        return jsonify({"error": str(e)}), 500

@payment_bp.route('/payment/verify/<tx_ref>', methods=['GET'])
@require_auth
def verify_payment(tx_ref):
    """Verify a payment transaction"""
    try:
        if not tx_ref:
            return jsonify({"error": "Missing transaction reference"}), 400
        
        # Initialize Chapa service
        from config.settings import get_config
        config = get_config()
        chapa_service = ChapaService(config)
        
        # Verify payment
        result = chapa_service.verify_payment(tx_ref)
        
        if result.get('status') == 'success':
            return jsonify({
                "status": "success",
                "message": "Payment verified successfully",
                "data": result.get('data', {})
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": result.get('message', 'Payment verification failed'),
                "error": result.get('error')
            }), 400
            
    except Exception as e:
        print(f"Payment verification error: {e}")
        return jsonify({
            "status": "error",
            "message": "Payment verification failed",
            "error": str(e)
        }), 500

@payment_bp.route('/payment/history', methods=['GET'])
@require_auth
def get_payment_history():
    """Get payment history for the current user"""
    try:
        user_id = request.user['uid']
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        # Get payment history from Firebase
        db = firebase_manager.get_db()
        transactions_ref = db.collection('transactions')
        
        # Query transactions for the user
        query = transactions_ref.where('user_id', '==', user_id)\
                               .order_by('created_at', direction=firebase_manager.get_query().DESCENDING)\
                               .limit(limit)\
                               .offset(offset)
        
        transactions = []
        for doc in query.stream():
            transaction_data = doc.to_dict()
            transaction_data['id'] = doc.id
            transactions.append(transaction_data)
        
        return jsonify({
            "status": "success",
            "data": {
                "transactions": transactions,
                "total": len(transactions),
                "limit": limit,
                "offset": offset
            }
        }), 200
        
    except Exception as e:
        print(f"Payment history error: {e}")
        return jsonify({
            "status": "error",
            "message": "Failed to fetch payment history",
            "error": str(e)
        }), 500 