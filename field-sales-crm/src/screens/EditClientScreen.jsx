import React, { useState, useMemo } from 'react';
import { SafeAreaView, Alert } from 'react-native';
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
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Client not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ClientForm
        initialData={client}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Update Client"
      />
    </SafeAreaView>
  );
};

export default EditClientScreen;

