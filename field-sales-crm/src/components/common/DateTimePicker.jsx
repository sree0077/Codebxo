import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView, Platform, StyleSheet } from 'react-native';
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
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.handle} />
            <Text style={styles.title}>
              Select Date
            </Text>

            {/* Simple Date Picker */}
            <View style={styles.dateRow}>
              {/* Month */}
              <View style={styles.monthColumn}>
                <Text style={styles.label}>Month</Text>
                <View style={styles.valueBox}>
                  <Text style={styles.valueText}>
                    {months[selectedDate.getMonth()]}
                  </Text>
                </View>
              </View>

              {/* Day */}
              <View style={styles.dayColumn}>
                <Text style={styles.label}>Day</Text>
                <View style={styles.valueBox}>
                  <Text style={styles.valueText}>
                    {selectedDate.getDate()}
                  </Text>
                </View>
              </View>

              {/* Year */}
              <View style={styles.yearColumn}>
                <Text style={styles.label}>Year</Text>
                <View style={styles.valueBox}>
                  <Text style={styles.valueText}>
                    {selectedDate.getFullYear()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Select Buttons */}
            <View style={styles.quickButtons}>
              <TouchableOpacity
                onPress={() => setSelectedDate(new Date())}
                style={styles.quickButton}
              >
                <Text style={styles.quickButtonText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow);
                }}
                style={styles.quickButton}
              >
                <Text style={styles.quickButtonText}>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setSelectedDate(nextWeek);
                }}
                style={styles.quickButton}
              >
                <Text style={styles.quickButtonText}>Next Week</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <View style={styles.buttonWrapper}>
                <Button title="Cancel" onPress={onClose} variant="secondary" />
              </View>
              <View style={styles.buttonWrapper}>
                <Button title="Confirm" onPress={handleConfirm} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    padding: 16,
  },
  handle: {
    width: 48,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  monthColumn: {
    flex: 1,
  },
  dayColumn: {
    width: 80,
  },
  yearColumn: {
    width: 96,
  },
  label: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  valueBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
  },
  valueText: {
    textAlign: 'center',
    color: '#1f2937',
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  quickButton: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickButtonText: {
    color: '#2563eb',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default DateTimePicker;

