import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Alert, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Client Info */}
          <View style={styles.clientInfo}>
            <Text style={styles.clientLabel}>Adding interaction for:</Text>
            <Text style={styles.clientName}>{clientName}</Text>
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

          <View style={styles.submitSection}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  clientInfo: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  clientLabel: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  clientName: {
    color: '#1e3a8a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitSection: {
    marginTop: 24,
    marginBottom: 32,
  },
});

export default AddInteractionScreen;

