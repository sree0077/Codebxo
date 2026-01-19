import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button, Dropdown } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { validateLoginForm } from '../utils/validators';

// Images - Using PNG for React Native compatibility
const bgImage = require('../../assets/bg.png');
const logoImage = require('../../assets/logo.png');

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [errors, setErrors] = useState({});

  const { login, register, isLoading, error, dismissError } = useAuth();

  const handleSubmit = async () => {
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setErrors({});

    if (isLogin) {
      await login(email, password);
    } else {
      await register(email, password, role);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    dismissError();
  };

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Image
                    source={logoImage}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.title}>Field Sales CRM</Text>
                <Text style={styles.subtitle}>
                  {isLogin ? 'Welcome back! Please login to continue.' : 'Create an account to get started.'}
                </Text>
              </View>

              {/* Card Container - Transparent */}
              <View style={styles.card}>
                {/* Error Message */}
                {error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Form */}
                <View style={styles.form}>
                  <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                  />

                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry={true}
                    error={errors.password}
                  />

                  {!isLogin && (
                    <Input
                      label="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      secureTextEntry={true}
                      error={errors.confirmPassword}
                    />
                  )}

                  {!isLogin && (
                    <Dropdown
                      label="Account Type"
                      value={role}
                      options={[
                        { label: 'User', value: 'user' },
                        { label: 'Admin', value: 'admin' },
                      ]}
                      onSelect={setRole}
                    />
                  )}
                </View>

                {/* Submit Button */}
                <Button
                  title={isLogin ? 'Login' : 'Create Account'}
                  onPress={handleSubmit}
                  loading={isLoading}
                />

                {/* Toggle Mode */}
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  </Text>
                  <TouchableOpacity onPress={toggleMode}>
                    <Text style={styles.toggleLink}>
                      {isLogin ? 'Sign Up' : 'Login'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Demo Credentials */}
              <View style={styles.demoBox}>
                <Text style={styles.demoIcon}>💡</Text>
                <Text style={styles.demoText}>
                  Use email and password (6+ chars)
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 60, // Extra padding to allow space for dropdowns at the bottom
  },
  content: {
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    overflow: 'visible', // Critical for absolute dropdowns
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7f68ea',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#5a6278',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 15,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 10,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  errorBox: {
    backgroundColor: '#fff1f2',
    borderLeftWidth: 4,
    borderLeftColor: '#f43f5e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  form: {
    marginBottom: 24,
    zIndex: 50, // Higher zIndex for form inputs
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  toggleText: {
    color: '#7c85a0',
    fontSize: 14,
  },
  toggleLink: {
    color: '#7f68ea',
    fontWeight: '600',
    fontSize: 14,
  },
  demoBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  demoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  demoText: {
    color: '#5a6278',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default LoginScreen;

