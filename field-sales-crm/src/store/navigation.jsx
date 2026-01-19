import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../features/auth/authSlice';
import { SCREENS } from '../utils/constants';
import { useSync } from '../hooks/useSync';
import {
  LoginScreen,
  ClientListScreen,
  ClientDetailScreen,
  AddClientScreen,
  EditClientScreen,
  AddInteractionScreen,
  MapViewScreen,
  AdminDashboardScreen,
  UserManagementScreen,
  AdminClientListScreen,
  AdminClientDetailScreen,
} from '../screens';

const Stack = createNativeStackNavigator();

// Auth Stack - for unauthenticated users
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
  </Stack.Navigator>
);

// Main Stack - for authenticated regular users
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#7f68ea' },
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
    <Stack.Screen
      name={SCREENS.MAP_VIEW}
      component={MapViewScreen}
      options={{ title: 'Map View' }}
    />
  </Stack.Navigator>
);

// Admin Stack - for authenticated administrators
const AdminStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#7f68ea' },
      headerTintColor: '#ffffff',
      headerTitleStyle: { fontWeight: 'bold' },
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen
      name={SCREENS.ADMIN_DASHBOARD}
      component={AdminDashboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name={SCREENS.USER_MANAGEMENT}
      component={UserManagementScreen}
      options={{ title: 'User Management' }}
    />
    <Stack.Screen
      name={SCREENS.ADMIN_CLIENT_LIST}
      component={AdminClientListScreen}
      options={{ title: 'Global Client Data' }}
    />
    <Stack.Screen
      name={SCREENS.ADMIN_CLIENT_DETAIL}
      component={AdminClientDetailScreen}
      options={{ title: 'Client Details (Admin)' }}
    />
    <Stack.Screen
      name={SCREENS.MAP_VIEW}
      component={MapViewScreen}
      options={{ title: 'Global Map' }}
    />
  </Stack.Navigator>
);

const RejectedAccessScreen = () => {
  const dispatch = useDispatch();

  return (
    <View style={styles.approvalContainer}>
      <Text style={styles.approvalIcon}>🚫</Text>
      <Text style={styles.approvalTitle}>Access Denied</Text>
      <Text style={styles.approvalText}>
        Your account access has been rejected by the administrator.
      </Text>
      <Text style={styles.approvalSubtitle}>
        If you believe this is a mistake, please contact support.
      </Text>
      <TouchableOpacity
        style={styles.logoutLink}
        onPress={() => dispatch(require('../features/auth/authSlice').logoutUser())}
      >
        <Text style={styles.logoutLinkText}>Go Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const AwaitingApprovalScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <View style={styles.approvalContainer}>
      <Text style={styles.approvalIcon}>⌛</Text>
      <Text style={styles.approvalTitle}>Awaiting Approval</Text>
      <Text style={styles.approvalText}>
        Hello, {user?.displayName || user?.email}. Your account is currently pending approval by an administrator.
      </Text>
      <Text style={styles.approvalSubtitle}>
        Once approved, you will be able to access the dashboard.
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => dispatch(loadUser())}
      >
        <Text style={styles.retryText}>Check Status</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.logoutLink}
        onPress={() => dispatch(require('../features/auth/authSlice').logoutUser())}
      >
        <Text style={styles.logoutLinkText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Simple loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#7f68ea" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const Navigation = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Initialize sync service
  const { isOnline, isSyncing } = useSync();

  // Load user on app initialization
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Show loading only briefly, then default to login
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        {!isAuthenticated ? (
          <AuthStack />
        ) : user?.status === 'rejected' ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="RejectedAccess" component={RejectedAccessScreen} />
          </Stack.Navigator>
        ) : user?.status === 'pending' ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AwaitingApproval" component={AwaitingApprovalScreen} />
          </Stack.Navigator>
        ) : user?.role === 'admin' ? (
          <AdminStack />
        ) : (
          <MainStack />
        )}
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
  approvalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
  },
  approvalIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  approvalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  approvalText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  approvalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#7f68ea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutLink: {
    padding: 10,
  },
  logoutLinkText: {
    color: '#7f68ea',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Navigation;

