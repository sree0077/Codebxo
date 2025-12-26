import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';

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

  const handleSelect = (option) => {
    onSelect(option.value);
    setIsOpen(false);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 font-medium mb-2 text-base">{label}</Text>
      )}
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        className={`
          flex-row items-center justify-between bg-gray-50 rounded-xl border-2 px-4 py-3
          ${error ? 'border-red-500' : 'border-gray-200'}
          ${disabled ? 'bg-gray-100 opacity-50' : ''}
        `}
        activeOpacity={0.7}
      >
        <Text className={`text-base ${selectedOption?.label ? 'text-gray-800' : 'text-gray-400'}`}>
          {selectedOption?.label || placeholder}
        </Text>
        <Text className="text-gray-400">▼</Text>
      </TouchableOpacity>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <SafeAreaView className="bg-white rounded-t-3xl max-h-[70%]">
            <View className="p-4 border-b border-gray-200">
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
              <Text className="text-lg font-bold text-gray-800 text-center">{label || 'Select Option'}</Text>
            </View>
            <FlatList
              data={options.filter((opt) => opt.value !== '')}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className={`
                    px-6 py-4 border-b border-gray-100
                    ${item.value === value ? 'bg-blue-50' : ''}
                  `}
                >
                  <Text
                    className={`text-base ${
                      item.value === value ? 'text-blue-600 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Dropdown;

