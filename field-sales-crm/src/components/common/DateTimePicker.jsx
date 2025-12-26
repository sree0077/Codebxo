import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView, Platform } from 'react-native';
import { Button } from './index';

const DateTimePicker = ({ value, onChange, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(value || new Date());

  // For web, we'll use a simple date picker UI
  // For native, you would use @react-native-community/datetimepicker

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth()) },
    (_, i) => i + 1
  );

  const handleConfirm = () => {
    onChange({ type: 'set' }, selectedDate);
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <SafeAreaView className="bg-white rounded-t-3xl">
          <View className="p-4">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <Text className="text-lg font-bold text-gray-800 text-center mb-4">
              Select Date
            </Text>

            {/* Simple Date Picker */}
            <View className="flex-row justify-center space-x-4 mb-6">
              {/* Month */}
              <View className="flex-1">
                <Text className="text-gray-500 text-sm mb-2 text-center">Month</Text>
                <View className="bg-gray-100 rounded-xl p-3">
                  <Text className="text-center text-gray-800">
                    {months[selectedDate.getMonth()]}
                  </Text>
                </View>
              </View>

              {/* Day */}
              <View className="w-20">
                <Text className="text-gray-500 text-sm mb-2 text-center">Day</Text>
                <View className="bg-gray-100 rounded-xl p-3">
                  <Text className="text-center text-gray-800">
                    {selectedDate.getDate()}
                  </Text>
                </View>
              </View>

              {/* Year */}
              <View className="w-24">
                <Text className="text-gray-500 text-sm mb-2 text-center">Year</Text>
                <View className="bg-gray-100 rounded-xl p-3">
                  <Text className="text-center text-gray-800">
                    {selectedDate.getFullYear()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Select Buttons */}
            <View className="flex-row justify-center space-x-2 mb-4">
              <TouchableOpacity
                onPress={() => setSelectedDate(new Date())}
                className="bg-blue-100 px-4 py-2 rounded-full"
              >
                <Text className="text-blue-600 text-sm">Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow);
                }}
                className="bg-blue-100 px-4 py-2 rounded-full"
              >
                <Text className="text-blue-600 text-sm">Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setSelectedDate(nextWeek);
                }}
                className="bg-blue-100 px-4 py-2 rounded-full"
              >
                <Text className="text-blue-600 text-sm">Next Week</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Button title="Cancel" onPress={onClose} variant="secondary" />
              </View>
              <View className="flex-1">
                <Button title="Confirm" onPress={handleConfirm} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
};

export default DateTimePicker;

