import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Keyboard
} from 'react-native';
import { webInteractive, webDisabled } from '../../utils/webStyles';

const Dropdown = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleToggle = () => {
    if (disabled) return;
    Keyboard.dismiss();
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    onSelect(option.value);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, { zIndex: isOpen ? 1000 : 1 }]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TouchableOpacity
        onPress={handleToggle}
        style={[
          styles.selector,
          error && styles.selectorError,
          disabled && styles.selectorDisabled,
          ...(Platform.OS === 'web' ? [disabled ? webDisabled : webInteractive] : []),
        ]}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.selectorText,
          !selectedOption?.label && styles.placeholderText
        ]}>
          {selectedOption?.label || placeholder}
        </Text>
        <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isOpen && (
        <View style={styles.popover}>
          <FlatList
            data={options.filter((opt) => opt.value !== '')}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={[
                  styles.option,
                  item.value === value && styles.optionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    item.value === value && styles.optionTextSelected
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            style={{ maxHeight: 200 }}
            scrollEnabled={options.length > 5}
            // For nested scroll on mobile
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
    // We set zIndex dynamically in the render to avoid overlapping other inputs when closed
  },
  label: {
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
    fontSize: 14,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectorError: {
    borderColor: '#ef4444',
  },
  selectorDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.5,
  },
  selectorText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  arrow: {
    color: '#9ca3af',
    fontSize: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  popover: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionSelected: {
    backgroundColor: '#f5f3ff',
  },
  optionText: {
    fontSize: 15,
    color: '#4b5563',
  },
  optionTextSelected: {
    color: '#7f68ea',
    fontWeight: 'bold',
  },
  listContent: {
    paddingVertical: 0,
  },
});

export default Dropdown;
