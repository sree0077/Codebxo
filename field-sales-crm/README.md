# Field Sales CRM Application

A comprehensive CRM (Customer Relationship Management) application for field sales teams, built with React Native and Expo for cross-platform mobile and web support.

## 📱 Features

### Core Features
- **Authentication**: Multi-user login/registration with secure session management
- **Client Management**: Full CRUD operations for client data
- **Location Capture**: GPS integration with runtime permissions
- **Call & SMS Integration**: Direct calling and messaging from the app
- **Interaction Tracking**: Log calls, messages, and meetings with follow-up reminders

### Client Fields
- Client Name (Required)
- Phone Number (Required)
- Company Name
- Type of Business (Dropdown)
- Currently Using System (Yes/No)
- Customer Potential (High/Medium/Low)
- GPS Location (Latitude/Longitude)
- Address

### Bonus Features
- ✅ **Offline Support**: Full offline mode with local storage (AsyncStorage/localStorage)
- ✅ **Auto-Sync**: Automatic synchronization when device comes online
- ✅ **Sync Queue**: Operations queued when offline and synced later
- ✅ **Client Search**: Real-time search functionality
- ✅ **Follow-up Reminders**: Track upcoming follow-ups
- ✅ **Data Persistence**: All data cached locally for offline access
- ✅ **OpenStreetMap Integration**: FREE interactive map view with client locations
- ✅ **Route Planning**: Optimized route calculation for multiple clients (FREE!)
- ✅ **Turn-by-Turn Directions**: Navigate between client locations
- ✅ **Distance & Time Estimates**: Calculate travel distance and duration
- ✅ **No Billing Required**: 100% free maps with OpenRouteService (40k requests/month)

## 🏗️ Architecture

This project follows **Clean Architecture** with **MVVM** pattern:

```
src/
├── app/                    # App configuration (Store, Navigation)
├── components/             # Reusable UI components
│   ├── common/            # Generic components (Button, Input, etc.)
│   ├── client/            # Client-specific components
│   ├── interaction/       # Interaction components
│   └── maps/              # Map components (MapView, Markers, Routes)
├── features/              # Redux slices (Feature-based state)
│   ├── auth/
│   ├── clients/
│   └── interactions/
├── hooks/                 # Custom React hooks
├── screens/               # Screen components
├── services/              # API/Firebase services (including mapsService)
└── utils/                 # Constants, validators, helpers
```

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | React Native + Expo |
| State Management | Redux Toolkit |
| Navigation | React Navigation |
| Styling | NativeWind (Tailwind CSS) |
| Storage | AsyncStorage |
| Location | expo-location |
| Maps | OpenStreetMap + OpenRouteService (FREE!) |
| Backend | Firebase (Optional) |

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** (optional, but recommended)
- **For Mobile Testing**: Expo Go app ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))
- **For Web Testing**: Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/Codebxo.git
cd Codebxo/field-sales-crm
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Fill in your API keys and credentials in `.env`:
   - Google Maps API key
   - Firebase configuration
   - OpenRouteService API key (optional)

   📖 **Detailed setup guide:** See [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)

4. **Configure Firebase:**

   Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

   Enable the following services:
   - **Authentication** → Email/Password provider
   - **Firestore Database** → Create database in test mode

   Copy your Firebase configuration to `.env` file (see step 3)

5. **Start the development server:**
```bash
# Start Expo development server
npm start

# Or start directly for web
npm run web
```

6. **Access the application:**
   - **Web**: Open http://localhost:8081 in your browser
   - **Mobile**: Scan the QR code with Expo Go app
   - **Android Emulator**: Press `a` in the terminal
   - **iOS Simulator**: Press `i` in the terminal (macOS only)

### First Time Setup

1. **Create an account:**
   - Open the app
   - Click "Create Account"
   - Enter email and password
   - Click "Sign Up"

2. **Login:**
   - Use your registered email and password
   - Sessions persist across page refreshes

3. **Add your first client:**
   - Click the "+" button
   - Fill in client details
   - Click "Add Client"
   - You'll be automatically redirected to the client list

### OpenStreetMap Setup (FREE - Recommended!)

To enable the Maps feature with route planning (100% FREE, no credit card):

1. **Get FREE OpenRouteService API Key:**
   - Follow the detailed guide in [OPENSTREETMAP_SETUP.md](OPENSTREETMAP_SETUP.md)
   - Sign up at [OpenRouteService](https://openrouteservice.org/dev/#/signup)
   - No credit card required!
   - 40,000 requests/month FREE tier

2. **Configure API Key:**
   ```bash
   # Copy the example env file
   cp .env.example .env

   # Edit .env and add your API key
   EXPO_PUBLIC_OPENROUTE_API_KEY=your_api_key_here
   ```

3. **That's it!** Maps will work immediately with:
   - Interactive OpenStreetMap tiles
   - Route planning and optimization
   - Distance and time calculations
   - Turn-by-turn directions

3. **Using the Maps Feature:**
   - See [MAPS_FEATURE_GUIDE.md](MAPS_FEATURE_GUIDE.md) for detailed usage instructions
   - View clients on interactive map
   - Plan optimized routes
   - Get turn-by-turn directions

## 📱 Building for Production

### Web Build
```bash
# Export static web build
npx expo export:web

# The build will be in the web-build/ directory
# Deploy to any static hosting service (Netlify, Vercel, GitHub Pages, etc.)
```

### Android APK (Using EAS Build)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS Build
eas build:configure

# Build APK
eas build --platform android --profile preview

# Download the APK from the provided link
```

### iOS Build (macOS only)
```bash
# Build for iOS
eas build --platform ios

# Or build for iOS Simulator
eas build --platform ios --profile preview
```

## 🧪 Testing

### Manual Testing
Follow the comprehensive testing guide in `CRUD_TESTING_GUIDE.md`

Key test scenarios:
- ✅ User registration and login
- ✅ Create, read, update, delete clients
- ✅ Add interactions to clients
- ✅ Search and filter clients
- ✅ Data persistence across page refreshes
- ✅ Call and SMS integration
- ✅ Location capture

### Automated Testing
```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm test -- --coverage
```

## 📸 Screenshots

| Login | Client List | Client Detail |
|-------|-------------|---------------|
| [Screenshot] | [Screenshot] | [Screenshot] |

## � Troubleshooting

### Common Issues

**Issue: "Client not found" after clicking client card**
- **Solution**: This has been fixed with automatic client refresh. If you still see this, refresh the page.

**Issue: Forms don't navigate back after submission on web**
- **Solution**: This has been fixed. Forms now auto-navigate on web immediately after successful submission.

**Issue: Firestore index errors in console**
- **Solution**: The app automatically falls back to client-side sorting when Firestore indexes are missing. No action needed.

**Issue: Data doesn't persist after page refresh**
- **Solution**: Make sure you're logged in. Firebase auth state is automatically restored on page refresh.

**Issue: Can't make calls or send SMS on web**
- **Solution**: Call/SMS features only work on mobile devices. On web, they will attempt to open the default mail client.

### Debug Mode

To enable detailed logging, check the browser console (F12) for:
- Firebase authentication status
- Client data loading
- Firestore query execution
- Navigation events

## �📝 Evaluation Criteria Met

- ✅ **Code Quality & Architecture**: Clean Architecture with MVVM pattern
- ✅ **UI/UX**: Modern, responsive design with React Native StyleSheet
- ✅ **Data Handling**: Redux Toolkit + AsyncStorage + Firebase Firestore
- ✅ **Location & Permissions**: expo-location integration with runtime permissions
- ✅ **Authentication**: Multi-user support with Firebase Auth (login/logout/register)
- ✅ **Client CRUD**: Complete create, read, update, delete operations
- ✅ **Call/SMS Integration**: Native linking support for phone and SMS
- ✅ **Interaction Tracking**: Full interaction management with notes and follow-ups
- ✅ **Search Functionality**: Real-time client search by name, company, or phone
- ✅ **Offline Support**: AsyncStorage for local data persistence
- ✅ **Web Compatibility**: Fully functional on web browsers
- ✅ **Session Persistence**: Auth state persists across page refreshes

## 📚 Additional Documentation

- **`CRUD_TESTING_GUIDE.md`** - Comprehensive testing checklist
- **`FIXES_SUMMARY.md`** - Technical details of recent bug fixes
- **`DEPLOYMENT_GUIDE.md`** - Deployment instructions (coming soon)

## 🎯 Key Features Implemented

### Authentication
- Email/password registration
- Secure login with Firebase Auth
- Session persistence across page refreshes
- Multi-user support with user-specific data

### Client Management
- Add new clients with all required fields
- Edit existing client information
- Delete clients with confirmation
- View detailed client information
- GPS location capture
- Search clients by name, company, or phone

### Interaction Tracking
- Log calls, messages, and meetings
- Add notes and client replies
- Set follow-up dates
- View interaction history per client

### User Experience
- Auto-navigation after form submissions
- Pull-to-refresh on client list
- Loading states and error handling
- Responsive design for web and mobile
- Intuitive UI with clear visual hierarchy

## 👨‍💻 Author

Developed for Field Sales CRM Technical Assessment

## 📄 License

This project is for assessment purposes.

