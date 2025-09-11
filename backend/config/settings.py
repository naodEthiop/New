import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Environment
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
    
    # Frontend URL
    FRONTEND_URL = os.getenv("VITE_FRONTEND_URL", "http://localhost:3000")
    
    # CORS Configuration
    CORS_ORIGINS = [
        'http://localhost:5173',  # Vite dev server
        'http://localhost:5174',  # Vite dev server (alternative port)
        'http://localhost:3000',  # Alternative dev server
        'https://localhost:5173', # HTTPS dev
        'https://localhost:5174', # HTTPS dev (alternative port)
        'https://localhost:3000', # HTTPS alternative
        FRONTEND_URL,            # Production URL
        'https://project-bolt-github-cjfyq9oi.vercel.app',  # Vercel deployment
        'https://project-bolt-github-cjfyq9oi-git-main.vercel.app'  # Vercel preview
    ]
    
    # Chapa Configuration
    CHAPA_SECRET_KEY = os.getenv("CHAPA_SECRET_KEY")
    CHAPA_PUBLIC_KEY = os.getenv("CHAPA_PUBLIC_KEY")
    CHAPA_BASE_URL = os.getenv("CHAPA_BASE_URL", "https://api.chapa.co/v1")
    
    # Callback Configuration
    CALLBACK_BASE_URL = os.getenv("CALLBACK_BASE_URL", "http://localhost:5000")
    
    # Telegram Configuration
    TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
    TELEGRAM_PAYMENT_PROVIDER_TOKEN = os.getenv('TELEGRAM_PAYMENT_PROVIDER_TOKEN')
    
    # Firebase Configuration
    FIREBASE_SERVICE_ACCOUNT_KEY = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
    
    # PlayHT Configuration (for TTS)
    PLAYHT_API_KEY = os.getenv('PLAYHT_API_KEY')
    PLAYHT_USER_ID = os.getenv('PLAYHT_USER_ID')
    
    # Admin Configuration
    ADMIN_UIDS = [
        "TxA6TQmBAGRZ9rt91YOX6UIymcX2"
    ]

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    ENVIRONMENT = 'development'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    ENVIRONMENT = 'production'

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    ENVIRONMENT = 'testing'

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.getenv('ENVIRONMENT', 'development')
    return config.get(env, config['default']) 