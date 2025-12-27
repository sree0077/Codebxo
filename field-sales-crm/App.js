import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import store from './src/store/store';
import Navigation from './src/store/navigation';

console.log('[APP] 🚀 Starting Field Sales CRM...');
console.log('[APP] 📱 Platform:', Platform.OS);
console.log('[APP] 📦 Platform Version:', Platform.Version);

// Wrapper component - use GestureHandlerRootView only on native
const RootWrapper = ({ children }) => {
  if (Platform.OS === 'web') {
    console.log('[APP] 🌐 Running on Web');
    return <View style={{ flex: 1 }}>{children}</View>;
  }
  console.log('[APP] 📱 Running on Native (Android/iOS)');
  return <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>;
};

export default function App() {
  console.log('[APP] ✅ App component mounted');
  return (
    <RootWrapper>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Navigation />
        </SafeAreaProvider>
      </Provider>
    </RootWrapper>
  );
}
