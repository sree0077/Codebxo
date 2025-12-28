# 🚀 Maps Feature - Quick Start Guide

Get the Maps feature up and running in 5 minutes!

## ⚡ Quick Setup (For Testing)

### Option 1: Test Without API Keys (Limited Functionality)

The app will work without Google Maps API keys, but the map won't display. You can still:
- Navigate to the Map View screen
- See the UI layout
- Test the route planning logic

Just skip the API key setup and run:
```bash
npm run web
```

### Option 2: Full Setup with Google Maps (Recommended)

#### Step 1: Get a Google Maps API Key (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Directions API
   - Distance Matrix API
4. Create an API key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the key

#### Step 2: Configure the App (1 minute)

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your API key
# For testing, you can use the same key for all platforms
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_WEB=YOUR_API_KEY_HERE
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=YOUR_API_KEY_HERE
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=YOUR_API_KEY_HERE
```

#### Step 3: Run the App

```bash
# For web (easiest for testing)
npm run web

# For mobile
npm start
# Then scan QR code with Expo Go
```

## 🎯 Testing the Maps Feature

### 1. Add Test Clients with Locations

First, add some clients with GPS locations:

```
Client 1:
- Name: "Tech Corp"
- Phone: "1234567890"
- Location: Capture current location or use test coordinates

Client 2:
- Name: "Sales Inc"
- Phone: "0987654321"
- Location: Capture current location or use test coordinates

Client 3:
- Name: "Business LLC"
- Phone: "5555555555"
- Location: Capture current location or use test coordinates
```

**Tip**: If you're testing on web, you can manually add test coordinates:
- San Francisco: 37.7749, -122.4194
- New York: 40.7128, -74.0060
- Los Angeles: 34.0522, -118.2437

### 2. Open Map View

1. From the Client List screen
2. Click the **"🗺️ Map View"** button
3. You should see all clients with locations on the map

### 3. Test Route Planning

1. Click **"📍 Plan Route"**
2. Tap on 2-3 client markers to select them (they turn blue)
3. Click **"Optimize Route"**
4. Watch the route appear with numbered waypoints
5. Check the distance and time estimates

### 4. Test Quick Actions

1. Tap any client marker
2. Try the **📞 Call** button (will open phone dialer)
3. Try the **💬 Message** button (will open SMS)

## 🐛 Troubleshooting

### Map Not Showing

**Problem**: Blank screen where map should be

**Solutions**:
1. Check browser console for errors
2. Verify API key is correct in `.env`
3. Make sure Maps JavaScript API is enabled
4. Check if domain is whitelisted (for production)

### "This page can't load Google Maps correctly"

**Problem**: Error message on map

**Solutions**:
1. API key is invalid or not set
2. Maps JavaScript API not enabled
3. Billing not enabled on Google Cloud (required even for free tier)

### No Clients on Map

**Problem**: Map loads but no markers

**Solutions**:
1. Make sure clients have GPS locations captured
2. Check if location permissions are granted
3. Verify clients are not filtered out by search

### Route Calculation Fails

**Problem**: "Failed to calculate route" error

**Solutions**:
1. Check if Directions API is enabled
2. Verify API key has access to Directions API
3. Make sure at least 2 clients are selected
4. Check internet connectivity

## 📊 Test Data

For quick testing, you can use these coordinates:

### San Francisco Bay Area
```javascript
// Downtown SF
{ latitude: 37.7749, longitude: -122.4194 }

// Oakland
{ latitude: 37.8044, longitude: -122.2712 }

// San Jose
{ latitude: 37.3382, longitude: -121.8863 }

// Berkeley
{ latitude: 37.8715, longitude: -122.2730 }

// Palo Alto
{ latitude: 37.4419, longitude: -122.1430 }
```

### New York City
```javascript
// Manhattan
{ latitude: 40.7589, longitude: -73.9851 }

// Brooklyn
{ latitude: 40.6782, longitude: -73.9442 }

// Queens
{ latitude: 40.7282, longitude: -73.7949 }

// Bronx
{ latitude: 40.8448, longitude: -73.8648 }
```

## 🎓 Next Steps

Once you've tested the basic functionality:

1. **Read the full guides**:
   - [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) - Complete API setup
   - [MAPS_FEATURE_GUIDE.md](MAPS_FEATURE_GUIDE.md) - Feature documentation

2. **Set up proper API restrictions**:
   - Restrict keys to specific APIs
   - Add domain/app restrictions
   - Set up billing alerts

3. **Test on mobile**:
   - Build native app for full functionality
   - Test GPS location capture
   - Test route following in real scenarios

4. **Optimize for production**:
   - Enable billing on Google Cloud
   - Set up usage quotas
   - Implement route caching
   - Add error tracking

## 💡 Pro Tips

- **Free Tier**: Google Maps offers $200/month free credit
- **Caching**: Route calculations are expensive - cache results
- **Batch Operations**: Use Distance Matrix API for multiple calculations
- **Testing**: Use web version for faster development iteration
- **Mobile**: Native builds required for full maps functionality

## 📞 Need Help?

- Check the [MAPS_FEATURE_GUIDE.md](MAPS_FEATURE_GUIDE.md) for detailed usage
- Review [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) for configuration
- Check Google Cloud Console for API errors
- Review browser console for JavaScript errors

Happy mapping! 🗺️

