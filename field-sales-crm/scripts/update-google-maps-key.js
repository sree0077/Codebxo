#!/usr/bin/env node

/**
 * Script to update Google Maps API key in app.json
 * Usage: node scripts/update-google-maps-key.js YOUR_API_KEY
 */

const fs = require('fs');
const path = require('path');

const apiKey = process.argv[2];

if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
  console.error('❌ Error: Please provide a valid Google Maps API key');
  console.log('\nUsage: node scripts/update-google-maps-key.js YOUR_API_KEY');
  console.log('\nExample: node scripts/update-google-maps-key.js AIzaSyABC123...');
  process.exit(1);
}

const appJsonPath = path.join(__dirname, '..', 'app.json');
const envPath = path.join(__dirname, '..', '.env');

try {
  // Update app.json
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  // Update Android config
  if (appJson.expo.android.config.googleMaps) {
    appJson.expo.android.config.googleMaps.apiKey = apiKey;
  }
  
  // Update iOS config
  if (appJson.expo.ios.config) {
    appJson.expo.ios.config.googleMapsApiKey = apiKey;
  }
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  console.log('✅ Updated app.json with Google Maps API key');
  
  // Update .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(
    /EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=.*/,
    `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=${apiKey}`
  );
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env with Google Maps API key');
  
  console.log('\n🎉 Google Maps API key updated successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Run: npx eas-cli build --profile development --platform android');
  console.log('2. Wait for build to complete');
  console.log('3. Download and install the APK on your device');
  console.log('4. Maps will now work with Google Maps! 🗺️\n');
  
} catch (error) {
  console.error('❌ Error updating files:', error.message);
  process.exit(1);
}

