import React, { useState, useMemo } from 'react';
import { SafeAreaView, Alert, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ClientForm } from '../components/client';
import { useClients } from '../hooks/useClients';

const EditClientScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { clientId } = route.params;

  const { getClientById, editClient } = useClients();
  const [isLoading, setIsLoading] = useState(false);

  const client = useMemo(() => getClientById(clientId), [clientId, getClientById]);

  const handleSubmit = async (clientData) => {
    setIsLoading(true);
    try {
      const result = await editClient(clientId, clientData);
      if (result.success) {
        Alert.alert('Success', 'Client updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update client');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!client) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Client not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ClientForm
        initialData={client}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Update Client"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: '#6b7280',
  },
});

export default EditClientScreen;

