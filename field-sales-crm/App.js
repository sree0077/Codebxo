import './global.css';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import store from './src/store/store';
import Navigation from './src/store/navigation';
import { loadUser } from './src/features/auth/authSlice';

// Component to initialize app and load user
const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load user from storage on app start
    dispatch(loadUser());
  }, [dispatch]);

  return children;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <AppInitializer>
            <Navigation />
          </AppInitializer>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
