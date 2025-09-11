import requests
import uuid
import time
from typing import Dict, Any, Optional
from firebase_admin import firestore

class ChapaService:
    """Chapa payment service"""
    
    def __init__(self, config):
        self.secret_key = config.CHAPA_SECRET_KEY
        self.public_key = config.CHAPA_PUBLIC_KEY
        self.base_url = config.CHAPA_BASE_URL
        self.callback_base_url = config.CALLBACK_BASE_URL
        self.frontend_url = config.FRONTEND_URL
    
    def create_payment(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a Chapa payment"""
        tx_ref = f"bingo-{uuid.uuid4()}"
        
        # Dynamically set callback and return URLs based on environment
        callback_url = self.callback_base_url + "/api/payment-callback"
        return_url = self.frontend_url + "/payment-complete"
        
        payload = {
            "amount": data.get("amount"),
            "currency": "ETB",
            "email": data.get("email"),
            "first_name": data.get("first_name"),
            "last_name": data.get("last_name"),
            "tx_ref": tx_ref,
            "callback_url": callback_url,
            "return_url": return_url,
            "customization[title]": "Bingo Game",
            "customization[description]": "Entry Fee"
        }
        
        headers = {"Authorization": f"Bearer {self.secret_key}"}
        
        try:
            response = requests.post(
                f"{self.base_url}/transaction/initialize",
                headers=headers,
                json=payload
            )
            chapa_res = response.json()
            
            if chapa_res.get("status") != "success":
                raise Exception(chapa_res.get("message", "Unknown error"))
            
            return {
                "checkout_url": chapa_res["data"]["checkout_url"],
                "tx_ref": tx_ref
            }
        except Exception as e:
            raise Exception(f"Chapa payment creation failed: {str(e)}")
    
    def verify_payment(self, tx_ref: str) -> Dict[str, Any]:
        """Verify a Chapa payment"""
        headers = {"Authorization": f"Bearer {self.secret_key}"}
        
        try:
            response = requests.get(
                f"{self.base_url}/transaction/verify/{tx_ref}",
                headers=headers
            )
            return response.json()
        except Exception as e:
            raise Exception(f"Payment verification failed: {str(e)}")
    
    def process_payment_callback(self, data: Dict[str, Any], db) -> bool:
        """Process payment callback from Chapa"""
        try:
            tx_ref = data.get('tx_ref')
            status = data.get('status')
            amount = data.get('amount')
            
            if not all([tx_ref, status, amount]):
                print(f"Incomplete payment data: {data}")
                return False
            
            if status != 'success':
                print(f"Payment failed for tx_ref: {tx_ref}")
                return False
            
            # Update transaction status in database
            transaction_ref = db.collection('transactions').where('tx_ref', '==', tx_ref).limit(1)
            transactions = transaction_ref.stream()
            
            for transaction in transactions:
                transaction_data = transaction.to_dict()
                user_id = transaction_data.get('userId')
                
                if user_id:
                    # Update wallet balance
                    wallet_ref = db.collection('wallets').document(user_id)
                    wallet_doc = wallet_ref.get()
                    
                    if wallet_doc.exists:
                        current_balance = wallet_doc.to_dict().get('balance', 0)
                        new_balance = current_balance + float(amount)
                        wallet_ref.update({
                            'balance': new_balance,
                            'updatedAt': firestore.SERVER_TIMESTAMP
                        })
                        
                        # Update transaction status
                        transaction.reference.update({
                            'status': 'completed',
                            'updatedAt': firestore.SERVER_TIMESTAMP
                        })
                        
                        print(f"Payment processed successfully for user {user_id}: {amount} ETB")
                        return True
            
            print(f"No transaction found for tx_ref: {tx_ref}")
            return False
            
        except Exception as e:
            print(f"Error processing payment callback: {e}")
            return False 