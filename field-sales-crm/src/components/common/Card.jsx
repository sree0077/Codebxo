import React from 'react';
import { View, TouchableOpacity } from 'react-native';

const Card = ({
  children,
  onPress,
  variant = 'default',
  padding = 'medium',
  style = {},
}) => {
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return 'p-0';
      case 'small':
        return 'p-3';
      case 'large':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'shadow-lg';
      case 'outlined':
        return 'border border-gray-200';
      default:
        return 'shadow-sm';
    }
  };

  const baseStyles = `bg-white rounded-2xl ${getPaddingStyles()} ${getVariantStyles()}`;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={baseStyles}
        style={style}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={baseStyles} style={style}>
      {children}
    </View>
  );
};

export default Card;

