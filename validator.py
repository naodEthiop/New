from dotenv import load_dotenv
load_dotenv()

import os
import json

def check_env_var(key):
    value = os.getenv(key)
    if value:
        print(f"[OK] {key} is set.")
    else:
        print(f"[ERROR] {key} is missing!")

def check_service_account():
    # Check env variable
    key_env = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
    if key_env:
        try:
            json.loads(key_env)
            print("[OK] FIREBASE_SERVICE_ACCOUNT_KEY env variable is valid JSON.")
        except Exception:
            print("[ERROR] FIREBASE_SERVICE_ACCOUNT_KEY env variable is not valid JSON!")
    # Check file
    for fname in ["serviceAccountKey.json", "serviceAccountkey.json"]:
        if os.path.isfile(fname):
            try:
                with open(fname) as f:
                    json.load(f)
                print(f"[OK] {fname} exists and is valid JSON.")
            except Exception:
                print(f"[ERROR] {fname} exists but is not valid JSON!")
            return
    print("[ERROR] No service account key file found!")

def main():
    print("Checking required environment variables...")
    required_env = [
        "VITE_FIREBASE_API_KEY", "VITE_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_PROJECT_ID",
        "VITE_FIREBASE_STORAGE_BUCKET", "VITE_FIREBASE_MESSAGING_SENDER_ID", "VITE_FIREBASE_APP_ID",
        "CHAPA_SECRET_KEY", "CHAPA_PUBLIC_KEY", "CHAPA_BASE_URL",
        "TELEGRAM_BOT_TOKEN", "TELEGRAM_PAYMENT_PROVIDER_TOKEN"
    ]
    for key in required_env:
        check_env_var(key)
    print("\nChecking Firebase service account...")
    check_service_account()
    print("\nDone.")

if __name__ == "__main__":
    main()