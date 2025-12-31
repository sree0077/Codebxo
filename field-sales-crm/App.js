import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import store from './src/store/store';
import Navigation from './src/store/navigation';
import { ErrorBoundary } from './src/components/common';

// Wrapper component - use GestureHandlerRootView only on native
const RootWrapper = ({ children }) => {
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }
  return <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <RootWrapper>
        <Provider store={store}>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <Navigation />
          </SafeAreaProvider>
        </Provider>
      </RootWrapper>
    </ErrorBoundary>
  );
}
