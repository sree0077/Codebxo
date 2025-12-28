# Google Maps Setup Guide

This guide will help you set up Google Maps API for the Field Sales CRM application.

## 🔑 Getting API Keys

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Field Sales CRM"
4. Click "Create"

### Step 2: Enable Required APIs

Enable the following APIs in your project:

1. **Maps JavaScript API** (for web)
   - Go to "APIs & Services" → "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"

2. **Directions API** (for route calculation)
   - Search for "Directions API"
   - Click "Enable"

3. **Distance Matrix API** (for distance calculations)
   - Search for "Distance Matrix API"
   - Click "Enable"

4. **Maps SDK for Android** (for Android app)
   - Search for "Maps SDK for Android"
   - Click "Enable"

5. **Maps SDK for iOS** (for iOS app)
   - Search for "Maps SDK for iOS"
   - Click "Enable"

### Step 3: Create API Keys

#### For Web (Maps JavaScript API)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Click "Edit API key" (pencil icon)
5. Under "API restrictions":
   - Select "Restrict key"
   - Check: Maps JavaScript API, Directions API, Distance Matrix API
6. Under "Website restrictions":
   - Add your domain (e.g., `localhost:8081`, `yourdomain.com`)
7. Click "Save"

#### For Android

1. Create another API key
2. Under "API restrictions":
   - Select "Restrict key"
   - Check: Maps SDK for Android, Directions API, Distance Matrix API
3. Under "Application restrictions":
   - Select "Android apps"
   - Add your package name and SHA-1 certificate fingerprint
4. Click "Save"

#### For iOS

1. Create another API key
2. Under "API restrictions":
   - Select "Restrict key"
   - Check: Maps SDK for iOS, Directions API, Distance Matrix API
3. Under "Application restrictions":
   - Select "iOS apps"
   - Add your bundle identifier
4. Click "Save"

## 📝 Configuration

### Step 1: Create .env file

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Step 2: Add your API keys to .env

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_WEB=your_web_api_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=your_android_api_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=your_ios_api_key_here
```

### Step 3: Update app.json (for native builds)

For Android, add your API key to `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY"
        }
      }
    }
  }
}
```

For iOS, add your API key to `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY"
      }
    }
  }
}
```

## 🚀 Testing

### Web

```bash
npm run web
```

Navigate to the Map View screen. You should see a Google Map with client markers.

### Mobile (Expo Go)

```bash
npm start
```

Scan the QR code with Expo Go app. Note: Google Maps may have limited functionality in Expo Go.

### Native Build (Recommended for full functionality)

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

## 💰 Pricing & Quotas

Google Maps Platform offers a **$200 monthly credit** for free.

### API Usage Costs (after free credit):
- **Maps JavaScript API**: $7 per 1,000 loads
- **Directions API**: $5 per 1,000 requests
- **Distance Matrix API**: $5 per 1,000 elements

### Recommended Optimizations:
1. **Cache route calculations** - Store calculated routes locally
2. **Batch requests** - Use Distance Matrix API for multiple calculations
3. **Set usage quotas** - Prevent unexpected charges
4. **Monitor usage** - Check Google Cloud Console regularly

## 🔒 Security Best Practices

1. **Never commit API keys** - Keep .env in .gitignore
2. **Use API restrictions** - Limit keys to specific APIs
3. **Use application restrictions** - Limit keys to your domains/apps
4. **Rotate keys regularly** - Change keys periodically
5. **Monitor usage** - Set up billing alerts

## 🐛 Troubleshooting

### "This page can't load Google Maps correctly"
- Check if Maps JavaScript API is enabled
- Verify API key is correct in .env
- Check browser console for specific error messages
- Ensure domain is whitelisted in API key restrictions

### Map not showing on mobile
- Verify correct API key for platform (Android/iOS)
- Check if Maps SDK is enabled for your platform
- Ensure app.json is configured correctly
- Try native build instead of Expo Go

### Route calculation fails
- Check if Directions API is enabled
- Verify API key has access to Directions API
- Check network connectivity
- Review API quota limits

## 📚 Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)

