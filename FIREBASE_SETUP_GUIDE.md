# Firebase Setup Guide - Fix Unauthorized Domain Error

## 🔥 **Quick Fix for "auth/unauthorized-domain" Error**

### **Step 1: Firebase Console Setup**

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com/
   ```

2. **Select Your Project:**
   - Click on your Bingo project

3. **Navigate to Authentication:**
   - Click "Authentication" in the left sidebar
   - Click "Settings" tab

### **Step 2: Add Authorized Domains**

In the "Authorized domains" section, add these domains:

```
localhost
127.0.0.1
bingo-game-39ba5.web.app
```

**For Development:**
- `localhost`
- `127.0.0.1`

**For Production:**
- Your custom domain (if any)
- Your Firebase hosting domain

### **Step 3: Configure Google Sign-In Provider**

1. **Go to Sign-in method:**
   - Click "Sign-in method" tab
   - Click on "Google" provider

2. **Enable Google Sign-In:**
   - Toggle "Enable" to ON
   - Add your project support email

3. **Add Authorized Domains:**
   - In the "Authorized domains" section, add the same domains as above

### **Step 4: Verify Environment Variables**

Make sure your `.env` file has the correct Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **Step 5: Test the Fix**

1. **Clear Browser Cache:**
   - Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
   - Or clear browser cache completely

2. **Test Sign-In:**
   - Try signing in with Google again
   - Should work without the unauthorized domain error

## 🚀 **Alternative Solutions**

### **Option 1: Use Firebase Hosting (Recommended)**

Deploy your app to Firebase Hosting:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Deploy
firebase deploy
```

### **Option 2: Use ngrok for Development**

For local development with a public URL:

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, expose your local server
ngrok http 5173

# Add the ngrok URL to Firebase authorized domains
```

### **Option 3: Configure Custom Domain**

If you have a custom domain:

1. **Add your domain to Firebase:**
   - Go to Hosting → Custom domains
   - Add your domain
   - Follow the DNS configuration steps

2. **Add to authorized domains:**
   - Add your custom domain to the authorized domains list

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Still getting unauthorized domain error:**
   - Wait 5-10 minutes for changes to propagate
   - Clear browser cache completely
   - Try in incognito/private mode

2. **Google Sign-In not working:**
   - Check if Google provider is enabled
   - Verify API key is correct
   - Check browser console for other errors

3. **Firebase config errors:**
   - Verify all environment variables are set
   - Check that project ID matches
   - Ensure API key is from the correct project

### **Debug Steps:**

1. **Check Firebase Console:**
   - Go to Authentication → Users
   - See if any sign-in attempts are logged

2. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for Firebase-related errors

3. **Test with Firebase CLI:**
   ```bash
   firebase auth:export users.json
   ```

## 📱 **Telegram Mini App Specific**

For Telegram Mini App deployment:

1. **Add Telegram domains:**
   ```
   web.telegram.org
   t.me
   ```

2. **Configure Telegram Bot:**
   - Set up webhook URL
   - Add bot token to environment variables

3. **Test in Telegram:**
   - Open your bot in Telegram
   - Try the sign-in flow

## ✅ **Verification Checklist**

- [ ] Firebase project selected
- [ ] Authentication enabled
- [ ] Google provider enabled
- [ ] Authorized domains added
- [ ] Environment variables configured
- [ ] Browser cache cleared
- [ ] Test sign-in works

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. **Check Firebase Status:**
   - https://status.firebase.google.com/

2. **Review Firebase Documentation:**
   - https://firebase.google.com/docs/auth

3. **Contact Support:**
   - Firebase Support: https://firebase.google.com/support
   - Google Cloud Support: https://cloud.google.com/support

---

**Note:** Changes to Firebase configuration can take a few minutes to propagate. If the error persists after following these steps, wait 5-10 minutes and try again. 