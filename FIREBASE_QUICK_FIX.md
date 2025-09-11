# 🔥 Firebase Unauthorized Domain Error - Quick Fix

## **The Problem**
You're getting this error: `FirebaseError: Firebase: Error (auth/unauthorized-domain)`

This means Firebase is blocking sign-in from your current domain.

## **🚀 Quick Fix (5 minutes)**

### **Step 1: Go to Firebase Console**
1. Open: https://console.firebase.google.com/
2. Select your Bingo project

### **Step 2: Add Authorized Domains**
1. Click **"Authentication"** in the left sidebar
2. Click **"Settings"** tab
3. Scroll down to **"Authorized domains"**
4. Click **"Add domain"**
5. Add these domains one by one:
   ```
   localhost
   127.0.0.1
   bingo-game-39ba5.web.app
   ```

### **Step 3: Enable Google Sign-In**
1. Click **"Sign-in method"** tab
2. Click on **"Google"**
3. Toggle **"Enable"** to ON
4. Add your support email
5. Click **"Save"**

### **Step 4: Create .env File**
Create a file called `.env` in your project root with:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

**Get these values from:**
- Firebase Console → Project Settings → General → Your apps → Web app

### **Step 5: Test**
1. Clear browser cache (Ctrl+Shift+R)
2. Restart your dev server: `npm run dev`
3. Try signing in again

## **🔧 If Still Not Working**

### **Option 1: Use Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### **Option 2: Use ngrok for Development**
```bash
npm install -g ngrok
npm run dev
# In another terminal:
ngrok http 5173
# Add the ngrok URL to Firebase authorized domains
```

### **Option 3: Check Your Domain**
Make sure you're accessing the app from:
- `http://localhost:5173` (not `http://127.0.0.1:5173`)
- Or add both to authorized domains

## **✅ Verification Checklist**

- [ ] Added `localhost` to authorized domains
- [ ] Added `127.0.0.1` to authorized domains  
- [ ] Added your Firebase hosting domain
- [ ] Enabled Google sign-in provider
- [ ] Created `.env` file with correct values
- [ ] Cleared browser cache
- [ ] Restarted dev server

## **🆘 Still Having Issues?**

1. **Wait 5-10 minutes** - Firebase changes take time to propagate
2. **Try incognito mode** - Bypasses browser cache
3. **Check browser console** - Look for other errors
4. **Verify project ID** - Make sure it matches in Firebase Console

## **📞 Need Help?**

- Firebase Support: https://firebase.google.com/support
- Check Firebase Status: https://status.firebase.google.com/

---

**Note:** The unauthorized domain error is a security feature. Once you add your domains to the authorized list, sign-in will work properly. 