import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { webInput, webInteractive } from '../../utils/webStyles';

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

  const getInputContainerStyle = () => {
    let baseStyle = [styles.inputContainer];
    if (isFocused) baseStyle.push(styles.inputFocused);
    if (error) baseStyle.push(styles.inputError);
    if (!editable) baseStyle.push(styles.inputDisabled);
    return baseStyle;
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={getInputContainerStyle()}>
        {icon && <View style={styles.iconLeft}>{icon}</View>}
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
          style={[
            styles.input,
            multiline && styles.multilineInput,
            ...(Platform.OS === 'web' ? [webInput] : [])
          ]}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={[
              styles.iconButton,
              ...(Platform.OS === 'web' ? [webInteractive] : [])
            ]}
          >
            <Text style={styles.iconText}>{showPassword ? '🙈' : '👁️'}</Text>
          </Pressable>
        )}
        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            style={[
              styles.iconButton,
              ...(Platform.OS === 'web' ? [webInteractive] : [])
            ]}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#eceff8',
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: '#7f68ea',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
  },
  iconLeft: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#1f2937',
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  iconButton: {
    padding: 8,
  },
  iconText: {
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
});

export default Input;

