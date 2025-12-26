import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
}) => {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
      <Text className="text-gray-400 mr-3 text-lg">🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className="flex-1 text-base text-gray-800"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} className="p-1">
          <Text className="text-gray-400 text-lg">✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;

