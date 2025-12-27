# Deployment Guide - Field Sales CRM

This guide covers deploying the Field Sales CRM application to various platforms.

---

## 📱 Platform Overview

The Field Sales CRM can be deployed to:
- **Web** (Static hosting)
- **Android** (APK or Google Play Store)
- **iOS** (App Store - macOS required)

---

## 🌐 Web Deployment

### Option 1: Netlify (Recommended)

1. **Build the web app:**
```bash
cd field-sales-crm
npx expo export:web
```

2. **Deploy to Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --dir=web-build --prod
```

3. **Or use Netlify UI:**
   - Go to [Netlify](https://www.netlify.com/)
   - Drag and drop the `web-build` folder
   - Done! Your app is live

### Option 2: Vercel

1. **Build the web app:**
```bash
npx expo export:web
```

2. **Deploy to Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: GitHub Pages

1. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

2. **Add to package.json:**
```json
{
  "scripts": {
    "predeploy": "expo export:web",
    "deploy": "gh-pages -d web-build"
  },
  "homepage": "https://YOUR_USERNAME.github.io/Codebxo"
}
```

3. **Deploy:**
```bash
npm run deploy
```

### Option 4: Firebase Hosting

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Initialize Firebase:**
```bash
firebase login
firebase init hosting
# Select web-build as public directory
```

3. **Deploy:**
```bash
npx expo export:web
firebase deploy --only hosting
```

---

## 🤖 Android Deployment

### Option 1: EAS Build (Recommended)

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login to Expo:**
```bash
eas login
```

3. **Configure EAS Build:**
```bash
cd field-sales-crm
eas build:configure
```

4. **Build APK:**
```bash
# For development/testing APK
eas build --platform android --profile preview

# For production AAB (Google Play)
eas build --platform android --profile production
```

5. **Download the APK:**
   - Check the terminal for the build URL
   - Download the APK from the provided link
   - Install on Android device

### Option 2: Local Build (Deprecated)

```bash
# This method is deprecated but still works
expo build:android -t apk
```

### Testing the APK

1. Enable "Install from Unknown Sources" on your Android device
2. Transfer the APK to your device
3. Install and test

---

## 🍎 iOS Deployment (macOS Only)

### Using EAS Build

1. **Build for iOS:**
```bash
eas build --platform ios --profile production
```

2. **For iOS Simulator (Testing):**
```bash
eas build --platform ios --profile preview
```

3. **Submit to App Store:**
```bash
eas submit --platform ios
```

---

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production` file:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Update app.json for Production

```json
{
  "expo": {
    "name": "Field Sales CRM",
    "slug": "field-sales-crm",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "package": "com.yourcompany.fieldsalescrm",
      "versionCode": 1
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.fieldsalescrm",
      "buildNumber": "1.0.0"
    }
  }
}
```

---

## 📊 Pre-Deployment Checklist

- [ ] All features tested and working
- [ ] Firebase configuration updated
- [ ] Environment variables set
- [ ] App icons and splash screens added
- [ ] Version numbers updated in app.json
- [ ] Privacy policy and terms of service added (if required)
- [ ] Analytics configured (optional)
- [ ] Error tracking setup (optional - Sentry, etc.)
- [ ] Performance optimizations done
- [ ] Security review completed
- [ ] Debug console.logs removed
- [ ] Production Firebase rules configured

---

## 🔒 Firebase Security Rules

### Firestore Rules (Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /clients/{clientId} {
      allow read, write: if request.auth != null &&
                          request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
                     request.auth.uid == request.resource.data.userId;
    }

    match /interactions/{interactionId} {
      allow read, write: if request.auth != null &&
                          request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
                     request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Storage Rules (if using Firebase Storage)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🐛 Deployment Troubleshooting

### Web Deployment Issues

**Issue: "Module not found" errors**
```bash
# Clear cache and rebuild
rm -rf node_modules web-build
npm install
npx expo export:web
```

**Issue: Firebase not working on deployed site**
- Check that Firebase config is correct
- Verify domain is added to Firebase authorized domains
- Check browser console for CORS errors

### Android Build Issues

**Issue: Build fails with "Gradle error"**
```bash
# Clear Expo cache
expo r -c

# Or use EAS Build which handles this automatically
eas build --platform android --clear-cache
```

**Issue: APK won't install on device**
- Check Android version compatibility
- Verify "Install from Unknown Sources" is enabled
- Try uninstalling previous version first

### iOS Build Issues

**Issue: "No provisioning profile found"**
- Make sure you have an Apple Developer account
- Use EAS Build which handles provisioning automatically

**Issue: Build succeeds but app crashes on launch**
- Check iOS version compatibility in app.json
- Review crash logs in Xcode or EAS dashboard

---

## 📈 Post-Deployment

### Monitoring

1. **Firebase Console:**
   - Monitor authentication activity
   - Check Firestore usage
   - Review error logs

2. **Analytics (Optional):**
   - Set up Firebase Analytics
   - Track user engagement
   - Monitor feature usage

3. **Performance:**
   - Use Firebase Performance Monitoring
   - Track app startup time
   - Monitor network requests

### Updates

**Web Updates:**
- Simply rebuild and redeploy
- Changes are instant for all users

**Mobile Updates:**
- Use Expo OTA updates for JavaScript changes
- For native changes, rebuild and redistribute APK/IPA

```bash
# Publish OTA update
eas update --branch production --message "Bug fixes"
```

---

## 🚀 Quick Deploy Commands

### Web (Netlify)
```bash
npx expo export:web && netlify deploy --dir=web-build --prod
```

### Android APK
```bash
eas build --platform android --profile preview
```

### iOS (macOS)
```bash
eas build --platform ios --profile production
```

---

## 📞 Support

For deployment issues:
1. Check [Expo Documentation](https://docs.expo.dev/)
2. Review [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
3. Check [Firebase Documentation](https://firebase.google.com/docs)
4. Visit [Expo Forums](https://forums.expo.dev/)

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Web app loads without errors
- ✅ Users can register and login
- ✅ All CRUD operations work
- ✅ Data persists across sessions
- ✅ Mobile app installs and runs smoothly
- ✅ Firebase security rules are active
- ✅ No console errors in production

