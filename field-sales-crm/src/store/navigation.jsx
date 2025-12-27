import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../features/auth/authSlice';
import { SCREENS } from '../utils/constants';
import {
  LoginScreen,
  ClientListScreen,
  ClientDetailScreen,
  AddClientScreen,
  EditClientScreen,
  AddInteractionScreen,
} from '../screens';

const Stack = createNativeStackNavigator();

// Auth Stack - for unauthenticated users
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
  </Stack.Navigator>
);

// Main Stack - for authenticated users
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#3b82f6' },
      headerTintColor: '#ffffff',
      headerTitleStyle: { fontWeight: 'bold' },
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen
      name={SCREENS.CLIENT_LIST}
      component={ClientListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name={SCREENS.CLIENT_DETAIL}
      component={ClientDetailScreen}
      options={{ title: 'Client Details' }}
    />
    <Stack.Screen
      name={SCREENS.ADD_CLIENT}
      component={AddClientScreen}
      options={{ title: 'Add Client' }}
    />
    <Stack.Screen
      name={SCREENS.EDIT_CLIENT}
      component={EditClientScreen}
      options={{ title: 'Edit Client' }}
    />
    <Stack.Screen
      name={SCREENS.ADD_INTERACTION}
      component={AddInteractionScreen}
      options={{ title: 'Add Interaction' }}
    />
  </Stack.Navigator>
);

// Simple loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#3b82f6" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const Navigation = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Load user on app initialization
  useEffect(() => {
    console.log('[NAVIGATION] 🧭 Navigation component mounted');
    console.log('[NAVIGATION] 📡 Dispatching loadUser...');
    dispatch(loadUser());
  }, [dispatch]);

  // Log auth state changes
  useEffect(() => {
    console.log('[NAVIGATION] 🔐 Auth state changed:', {
      isAuthenticated,
      isLoading,
    });
  }, [isAuthenticated, isLoading]);

  // Show loading only briefly, then default to login
  if (isLoading) {
    console.log('[NAVIGATION] ⏳ Showing loading screen...');
    return <LoadingScreen />;
  }

  console.log('[NAVIGATION] ✅ Rendering', isAuthenticated ? 'MainStack' : 'AuthStack');

  return (
    <View style={styles.container}>
      <NavigationContainer>
        {isAuthenticated ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4b5563',
  },
});

export default Navigation;

