import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, StyleSheet } from 'react-native';
import { Input, Button, Dropdown } from '../common';
import { INTERACTION_TYPES } from '../../utils/constants';
import { validateInteractionForm } from '../../utils/validators';
import DateTimePicker from '../common/DateTimePicker';

const InteractionForm = ({
  clientId,
  clientName,
  onSubmit,
  isLoading = false,
  initialData = {},
}) => {
  const [formData, setFormData] = useState({
    type: '',
    notes: '',
    clientReply: '',
    followUpDate: null,
    clientId,
    clientName,
    ...initialData,
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleChange('followUpDate', selectedDate.toISOString());
    }
  };

  const handleSubmit = () => {
    const validation = validateInteractionForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    onSubmit(formData);
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientText}>Client: {clientName}</Text>
        </View>

        <Dropdown
          label="Interaction Type *"
          value={formData.type}
          options={INTERACTION_TYPES}
          onSelect={(value) => handleChange('type', value)}
          error={errors.type}
        />

        <Input
          label="Notes *"
          value={formData.notes}
          onChangeText={(value) => handleChange('notes', value)}
          placeholder="Enter interaction notes..."
          multiline
          numberOfLines={4}
          error={errors.notes}
        />

        <Input
          label="Client Reply"
          value={formData.clientReply}
          onChangeText={(value) => handleChange('clientReply', value)}
          placeholder="Enter client's response..."
          multiline
          numberOfLines={3}
        />

        {/* Follow-up Date */}
        <View style={styles.dateSection}>
          <Input
            label="Follow-up Date"
            value={formatDateDisplay(formData.followUpDate)}
            placeholder="Select follow-up date"
            editable={false}
            rightIcon={<Text style={styles.calendarIcon}>📅</Text>}
            onRightIconPress={() => setShowDatePicker(true)}
          />
          <Button
            title="📅 Set Follow-up Date"
            onPress={() => setShowDatePicker(true)}
            variant="outline"
            size="small"
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.followUpDate ? new Date(formData.followUpDate) : new Date()}
            onChange={handleDateChange}
            onClose={() => setShowDatePicker(false)}
          />
        )}

        <View style={styles.submitSection}>
          <Button
            title="Save Interaction"
            onPress={handleSubmit}
            loading={isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  clientInfo: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  clientText: {
    color: '#1d4ed8',
    fontSize: 14,
  },
  dateSection: {
    marginBottom: 16,
  },
  calendarIcon: {
    color: '#9ca3af',
  },
  submitSection: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default InteractionForm;

