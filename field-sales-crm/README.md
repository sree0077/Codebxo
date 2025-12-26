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
- ✅ Offline support with local storage
- ✅ Client search functionality
- ✅ Follow-up reminders
- 🔄 Google Maps integration (planned)

## 🏗️ Architecture

This project follows **Clean Architecture** with **MVVM** pattern:

```
src/
├── app/                    # App configuration (Store, Navigation)
├── components/             # Reusable UI components
│   ├── common/            # Generic components (Button, Input, etc.)
│   ├── client/            # Client-specific components
│   └── interaction/       # Interaction components
├── features/              # Redux slices (Feature-based state)
│   ├── auth/
│   ├── clients/
│   └── interactions/
├── hooks/                 # Custom React hooks
├── screens/               # Screen components
├── services/              # API/Firebase services
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
| Backend | Firebase (Optional) |

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For mobile: Expo Go app on your device

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/Codebxo.git
cd Codebxo/field-sales-crm
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
# For all platforms
npx expo start

# For web only
npm run web

# For Android
npm run android

# For iOS
npm run ios
```

### Firebase Configuration (Optional)

To enable cloud sync, update `src/services/firebase.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 📱 Building for Production

### Web Build
```bash
npx expo export:web
```

### Android APK
```bash
npx expo build:android -t apk
# or using EAS Build
eas build --platform android
```

### iOS Build
```bash
eas build --platform ios
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📸 Screenshots

| Login | Client List | Client Detail |
|-------|-------------|---------------|
| [Screenshot] | [Screenshot] | [Screenshot] |

## 📝 Evaluation Criteria Met

- ✅ **Code Quality & Architecture**: Clean Architecture with MVVM
- ✅ **UI/UX**: Modern, responsive design with Tailwind CSS
- ✅ **Data Handling**: Redux Toolkit + AsyncStorage
- ✅ **Location & Permissions**: expo-location integration
- ✅ **Authentication**: Multi-user support with login/logout
- ✅ **Client CRUD**: Complete create, read, update, delete
- ✅ **Call/SMS Integration**: Native linking support

## 👨‍💻 Author

Developed for Field Sales CRM Technical Assessment

## 📄 License

This project is for assessment purposes.

