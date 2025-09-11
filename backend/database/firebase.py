import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from typing import Optional

class FirebaseManager:
    """Firebase database manager"""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.db = None
            self._initialized = True
    
    def initialize(self, config):
        """Initialize Firebase connection"""
        try:
            service_account_key = config.FIREBASE_SERVICE_ACCOUNT_KEY
            if service_account_key:
                # Parse JSON string from environment variable
                service_account_info = json.loads(service_account_key)
                cred = credentials.Certificate(service_account_info)
            else:
                # Try both possible filenames
                try:
                    cred = credentials.Certificate("./serviceAccountKey.json")
                except FileNotFoundError:
                    cred = credentials.Certificate("./serviceAccountkey.json")
            
            firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            print("Firebase initialized successfully")
            return True
        except Exception as e:
            print(f"Firebase initialization error: {e}")
            self.db = None
            return False
    
    def get_db(self):
        """Get Firestore database instance"""
        return self.db
    
    def is_initialized(self):
        """Check if Firebase is initialized"""
        return self.db is not None

# Global Firebase manager instance
firebase_manager = FirebaseManager() 
