import React from 'react';
import { View, Text } from 'react-native';
import Button from './Button';

const EmptyState = ({
  icon = '📭',
  title = 'No data found',
  message = 'There is nothing to display here yet.',
  actionTitle,
  onAction,
}) => {
  return (
    <View className="flex-1 items-center justify-center py-12 px-6">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-xl font-bold text-gray-800 text-center mb-2">{title}</Text>
      <Text className="text-gray-500 text-center mb-6">{message}</Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          fullWidth={false}
          style={{ paddingHorizontal: 32 }}
        />
      )}
    </View>
  );
};

export default EmptyState;

