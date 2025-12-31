# EAS Build Environment Variables Setup

## 🚨 Critical Issue: App Crashes on Startup

If your app shows "Something went wrong" immediately after installation, it's likely because **environment variables are not configured in EAS Build**.

## Root Cause

The app requires Firebase and Google Maps API keys to function. In development, these are loaded from `.env` file. However, **EAS Build does not automatically read `.env` files**. You must configure them explicitly.

## Solution: Configure Environment Variables in EAS

### Method 1: Using EAS Secrets (Recommended for Production)

1. **Set secrets using EAS CLI:**

```bash
# Navigate to project directory
cd field-sales-crm

# Set each environment variable as a secret
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "YOUR_ACTUAL_API_KEY"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "YOUR_ACTUAL_API_KEY"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "YOUR_PROJECT.firebaseapp.com"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "YOUR_PROJECT_ID"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "YOUR_PROJECT.firebasestorage.app"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "YOUR_SENDER_ID"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value "YOUR_APP_ID"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID --value "YOUR_MEASUREMENT_ID"
```

2. **Update eas.json to use secrets:**

The `eas.json` file has been updated to reference these environment variables. The empty strings will be replaced by EAS secrets during build.

3. **Rebuild the app:**

```bash
eas build --platform android --profile preview
```

### Method 2: Using .env File (Quick Fix for Testing)

1. **Update eas.json with actual values:**

Edit `field-sales-crm/eas.json` and replace the empty strings in the `env` section with your actual API keys:

```json
"preview": {
  "distribution": "internal",
  "env": {
    "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY": "AIzaSy...",
    "EXPO_PUBLIC_FIREBASE_API_KEY": "AIzaSy...",
    ...
  }
}
```

⚠️ **Warning**: This method exposes your API keys in the repository. Only use for testing!

2. **Rebuild:**

```bash
eas build --platform android --profile preview
```

## Verify Environment Variables

After setting up, verify your secrets:

```bash
eas secret:list
```

## Get Your API Keys

### Google Maps API Key
1. Go to: https://console.cloud.google.com/google/maps-apis
2. Create/select a project
3. Enable: Maps SDK for Android, Maps SDK for iOS, Geocoding API, Directions API
4. Create credentials → API Key

### Firebase Configuration
1. Go to: https://console.firebase.google.com
2. Select your project
3. Go to Project Settings → General
4. Scroll to "Your apps" section
5. Copy all configuration values

## Testing the Fix

After rebuilding with environment variables:

1. Install the new APK on your device
2. The app should now start successfully
3. You should see the login screen instead of the error
4. Check logs if issues persist

## Troubleshooting

If the app still crashes:

1. **Check EAS secrets are set:**
   ```bash
   eas secret:list
   ```

2. **View build logs:**
   - Go to your build URL on expo.dev
   - Check for environment variable warnings

3. **Enable detailed error logging:**
   - The ErrorBoundary now shows error details even in production
   - Take a screenshot of the error message

4. **Verify Firebase config:**
   - Ensure all Firebase values are correct
   - Check Firebase project is active

## Next Build Command

```bash
# Clean build with environment variables
eas build --platform android --profile preview --clear-cache
```

This will create a new APK with properly configured environment variables.

