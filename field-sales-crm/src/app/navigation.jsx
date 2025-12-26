import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { SCREENS } from '../utils/constants';
import {
  LoginScreen,
  ClientListScreen,
  ClientDetailScreen,
  AddClientScreen,
  EditClientScreen,
  AddInteractionScreen,
} from '../screens';
import { LoadingSpinner } from '../components/common';

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

const Navigation = () => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Navigation;

