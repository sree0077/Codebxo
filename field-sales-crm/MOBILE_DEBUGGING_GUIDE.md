# Mobile Debugging Guide

## Critical Fix Applied ✅

### Issue: Type Casting Error on Android
**Error:** `java.lang.String cannot be cast to java.lang.Boolean`

**Root Cause:** NativeWind (Tailwind CSS for React Native) was configured in `babel.config.js` but all className usage had been removed. This caused the Babel transformer to inject incompatible code that failed on Android.

**Fix:** Removed NativeWind from `babel.config.js`

---

## How to View Logs on Mobile

### Method 1: React Native Debugger (Recommended)

1. **Shake your device** or press `Cmd+D` (iOS) / `Cmd+M` (Android emulator)
2. Select **"Debug"** or **"Open Debugger"**
3. This will open Chrome DevTools
4. Go to the **Console** tab
5. All logs will appear here with emoji prefixes

### Method 2: Expo Dev Tools

1. When you run `npm start`, Expo Dev Tools opens in your browser
2. Look for the **"Logs"** section
3. All console.log statements will appear here

### Method 3: Terminal Logs

1. Keep the terminal open where you ran `npm start`
2. Logs will appear directly in the terminal
3. Look for lines starting with `LOG`

### Method 4: React Native Debugger App (Advanced)

1. Install React Native Debugger: https://github.com/jhen0409/react-native-debugger
2. Run the app
3. Shake device and select "Debug"
4. Logs appear in the standalone debugger app

---

## Log Prefixes Guide

All logs use emoji prefixes for easy identification:

| Prefix | Category | Description |
|--------|----------|-------------|
| 🚀 | App | Application startup and initialization |
| 📱 | Platform | Platform detection (iOS/Android/Web) |
| 🔥 | Firebase | Firebase initialization and operations |
| 🔐 | Auth | Authentication (login) |
| 📝 | Register | User registration |
| ✅ | Success | Successful operations |
| ❌ | Error | Errors and failures |
| ⚠️ | Warning | Warnings and fallbacks |
| 🧭 | Navigation | Navigation state changes |
| ⏳ | Loading | Loading states |
| 📥 | Data Load | Data fetching operations |
| ➕ | Data Add | Creating new data |
| 🔄 | Retry | Retry operations |

---

## What to Look For

### 1. App Startup
```
[APP] 🚀 Starting Field Sales CRM...
[APP] 📱 Platform: android
[APP] ✅ App component mounted
[FIREBASE] 🔥 Initializing Firebase...
[FIREBASE] ✅ Firebase initialized successfully
```

### 2. Authentication Flow
```
[LOGIN] 🔐 LoginScreen mounted
[LOGIN] 📝 Form submitted: { isLogin: true, email: 'user@example.com' }
[LOGIN] 🔐 Attempting login...
[AUTH] 🔐 Login attempt for: user@example.com
[FIREBASE] 🔐 Attempting login for: user@example.com
[FIREBASE] ✅ Login successful
[AUTH] ✅ Login successful: user@example.com
```

### 3. Client Operations
```
[CLIENTS] 📥 Loading clients for user: abc123
[FIREBASE] 📥 Fetching clients for user: abc123
[FIREBASE] ✅ Fetched 5 clients
[CLIENTS] ✅ Loaded 5 clients
```

### 4. Error Scenarios
```
[FIREBASE] ❌ Login error: auth/wrong-password The password is invalid
[AUTH] ❌ Login error: The password is invalid
```

---

## Common Issues and Solutions

### Issue: No logs appearing

**Solution:**
1. Make sure you're in development mode
2. Shake device and enable "Debug"
3. Check that Chrome DevTools is open
4. Try reloading the app (Cmd+R / Ctrl+R)

### Issue: App crashes immediately

**Solution:**
1. Check the terminal for error messages
2. Look for red error screens on device
3. Check ErrorBoundary screen for error details
4. Clear cache: `expo r -c`

### Issue: Firebase errors

**Solution:**
1. Check Firebase config in `src/services/firebase.js`
2. Verify Firebase project is active
3. Check internet connection
4. Look for `[FIREBASE]` logs to see exact error

---

## Testing Checklist

After applying fixes, test these scenarios:

- [ ] App launches without errors
- [ ] Login screen appears
- [ ] Can register new account
- [ ] Can login with existing account
- [ ] Client list loads
- [ ] Can add new client
- [ ] Can view client details
- [ ] Can edit client
- [ ] Can delete client
- [ ] Can add interaction
- [ ] Data persists after app restart

---

## Next Steps

1. **Clear app cache:**
   ```bash
   expo r -c
   ```

2. **Reinstall the app on your device:**
   - Uninstall the old version
   - Run `npm start` and scan QR code again

3. **Check logs:**
   - Enable debugging on device
   - Watch console for any errors
   - Share logs if issues persist

4. **Report issues:**
   - Take screenshot of error (if any)
   - Copy relevant logs from console
   - Note the exact steps to reproduce

---

## Emergency Reset

If the app is completely broken:

```bash
# 1. Stop the dev server (Ctrl+C)

# 2. Clear all caches
expo r -c
rm -rf node_modules
npm install

# 3. Restart
npm start
```

---

## Contact

If you encounter issues:
1. Check the logs using methods above
2. Look for error patterns in the console
3. Share the logs with emoji prefixes for faster debugging

