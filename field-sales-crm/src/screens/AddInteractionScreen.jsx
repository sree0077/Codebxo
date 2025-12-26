import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Input, Button, Dropdown } from '../components/common';
import { useInteractions } from '../hooks/useInteractions';
import { INTERACTION_TYPES } from '../utils/constants';
import { validateInteractionForm } from '../utils/validators';

const AddInteractionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { clientId, clientName } = route.params;
  
  const { createInteraction } = useInteractions();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    type: '',
    notes: '',
    clientReply: '',
    followUpDate: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    const validation = validateInteractionForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      const interactionData = {
        ...formData,
        clientId,
        clientName,
        followUpDate: formData.followUpDate || null,
      };
      
      const result = await createInteraction(interactionData);
      if (result.success) {
        Alert.alert('Success', 'Interaction added successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to add interaction');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate next 30 days for follow-up
  const followUpOptions = [
    { label: 'No Follow-up', value: '' },
    { label: 'Tomorrow', value: new Date(Date.now() + 86400000).toISOString() },
    { label: 'In 3 Days', value: new Date(Date.now() + 3 * 86400000).toISOString() },
    { label: 'In 1 Week', value: new Date(Date.now() + 7 * 86400000).toISOString() },
    { label: 'In 2 Weeks', value: new Date(Date.now() + 14 * 86400000).toISOString() },
    { label: 'In 1 Month', value: new Date(Date.now() + 30 * 86400000).toISOString() },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Client Info */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <Text className="text-blue-700 font-semibold">Adding interaction for:</Text>
            <Text className="text-blue-800 text-lg font-bold">{clientName}</Text>
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
            placeholder="What was discussed? Key points..."
            multiline
            numberOfLines={4}
            error={errors.notes}
          />

          <Input
            label="Client Reply"
            value={formData.clientReply}
            onChangeText={(value) => handleChange('clientReply', value)}
            placeholder="Client's response or feedback..."
            multiline
            numberOfLines={3}
          />

          <Dropdown
            label="Follow-up Reminder"
            value={formData.followUpDate}
            options={followUpOptions}
            onSelect={(value) => handleChange('followUpDate', value)}
          />

          <View className="mt-6 mb-8">
            <Button
              title="Save Interaction"
              onPress={handleSubmit}
              loading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddInteractionScreen;

