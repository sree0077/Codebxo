import React, { useState } from 'react';
import { View, ScrollView, Platform } from 'react-native';
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
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        <View className="bg-blue-50 rounded-xl p-3 mb-4">
          <View className="text-blue-700 text-sm">Client: {clientName}</View>
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
        <View className="mb-4">
          <Input
            label="Follow-up Date"
            value={formatDateDisplay(formData.followUpDate)}
            placeholder="Select follow-up date"
            editable={false}
            rightIcon={<View><View className="text-gray-400">📅</View></View>}
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

        <View className="mt-4 mb-8">
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

export default InteractionForm;

