import React, { useState } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Input, Button } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { validateLoginForm } from '../utils/validators';

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  const { login, register, isLoading, error, dismissError } = useAuth();

  const handleSubmit = async () => {
    // Validate form
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Check confirm password for registration
    if (!isLogin && password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setErrors({});
    
    if (isLogin) {
      await login(email, password);
    } else {
      await register(email, password);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    dismissError();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 justify-center">
            {/* Header */}
            <View className="items-center mb-10">
              <Text className="text-5xl mb-4">📊</Text>
              <Text className="text-3xl font-bold text-gray-800">Field Sales CRM</Text>
              <Text className="text-gray-500 mt-2 text-center">
                {isLogin ? 'Welcome back! Please login to continue.' : 'Create an account to get started.'}
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <Text className="text-red-600 text-center">{error}</Text>
              </View>
            )}

            {/* Form */}
            <View className="mb-6">
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                icon={<Text className="text-gray-400">✉️</Text>}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password}
                icon={<Text className="text-gray-400">🔒</Text>}
              />

              {!isLogin && (
                <Input
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry
                  error={errors.confirmPassword}
                  icon={<Text className="text-gray-400">🔒</Text>}
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
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-500">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text className="text-blue-500 font-semibold">
                  {isLogin ? 'Sign Up' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Credentials */}
            <View className="mt-8 p-4 bg-gray-50 rounded-xl">
              <Text className="text-gray-500 text-center text-sm">
                💡 Demo: Use any email and password (6+ chars)
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

