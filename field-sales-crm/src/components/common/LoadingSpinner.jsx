import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4 text-base">{message}</Text>
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-gray-600 mt-4 text-base">{message}</Text>
    </View>
  );
};

export default LoadingSpinner;

