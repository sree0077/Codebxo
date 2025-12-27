import React, { useState } from 'react';
import { SafeAreaView, Alert, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ClientForm } from '../components/client';
import { useClients } from '../hooks/useClients';

const AddClientScreen = () => {
  const navigation = useNavigation();
  const { createClient } = useClients();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (clientData) => {
    setIsLoading(true);
    try {
      const result = await createClient(clientData);
      if (result.success) {
        // On web, navigate immediately. On mobile, show alert first
        if (Platform.OS === 'web') {
          navigation.goBack();
        } else {
          Alert.alert('Success', 'Client added successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to add client');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ClientForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Add Client"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default AddClientScreen;

