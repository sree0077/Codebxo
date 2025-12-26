import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  icon = null,
  rightIcon = null,
  onRightIconPress = null,
  style = {},
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4" style={style}>
      {label && (
        <Text className="text-gray-700 font-medium mb-2 text-base">{label}</Text>
      )}
      <View
        className={`
          flex-row items-center bg-gray-50 rounded-xl border-2 px-4
          ${isFocused ? 'border-blue-500 bg-white' : 'border-gray-200'}
          ${error ? 'border-red-500' : ''}
          ${!editable ? 'bg-gray-100' : ''}
        `}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            flex-1 py-3 text-gray-800 text-base
            ${multiline ? 'min-h-[100px] textAlignVertical-top' : ''}
          `}
          style={multiline ? { textAlignVertical: 'top' } : {}}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
            <Text className="text-gray-500">{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} className="p-2">
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};

export default Input;

