import React, { useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card, Button } from '../components/common';
import { InteractionCard } from '../components/interaction';
import { useClients } from '../hooks/useClients';
import { useInteractions } from '../hooks/useInteractions';
import { SCREENS, BUSINESS_TYPES, CUSTOMER_POTENTIAL } from '../utils/constants';
import { makePhoneCall, sendSMS, getInitials, getPotentialColor, formatDate } from '../utils/helpers';

const ClientDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { clientId } = route.params;
  
  const { getClientById, removeClient } = useClients();
  const { getClientInteractions, removeInteraction } = useInteractions();
  
  const client = useMemo(() => getClientById(clientId), [clientId, getClientById]);
  const interactions = useMemo(() => getClientInteractions(clientId), [clientId, getClientInteractions]);

  const businessType = BUSINESS_TYPES.find((b) => b.value === client?.businessType);
  const potential = CUSTOMER_POTENTIAL.find((p) => p.value === client?.customerPotential);
  const potentialColor = getPotentialColor(client?.customerPotential);

  const handleEdit = useCallback(() => {
    navigation.navigate(SCREENS.EDIT_CLIENT, { clientId });
  }, [navigation, clientId]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Client', 'Are you sure you want to delete this client?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeClient(clientId);
          navigation.goBack();
        },
      },
    ]);
  }, [clientId, removeClient, navigation]);

  const handleAddInteraction = useCallback(() => {
    navigation.navigate(SCREENS.ADD_INTERACTION, { clientId, clientName: client?.clientName });
  }, [navigation, clientId, client?.clientName]);

  if (!client) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Client not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View className="bg-blue-500 px-4 pt-4 pb-8">
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-3">
              <Text className="text-2xl font-bold text-blue-500">
                {getInitials(client.clientName)}
              </Text>
            </View>
            <Text className="text-white text-xl font-bold">{client.clientName}</Text>
            {client.companyName && (
              <Text className="text-blue-100 text-sm">{client.companyName}</Text>
            )}
            {potential && (
              <View className="mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Text className="text-white text-xs capitalize">{potential.label} Potential</Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-4 -mt-4">
          {/* Quick Actions */}
          <Card style={{ marginBottom: 16 }}>
            <View className="flex-row justify-around">
              <TouchableOpacity onPress={() => makePhoneCall(client.phoneNumber)} className="items-center p-3">
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-1">
                  <Text className="text-xl">📞</Text>
                </View>
                <Text className="text-gray-600 text-xs">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendSMS(client.phoneNumber)} className="items-center p-3">
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-1">
                  <Text className="text-xl">💬</Text>
                </View>
                <Text className="text-gray-600 text-xs">Message</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} className="items-center p-3">
                <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mb-1">
                  <Text className="text-xl">✏️</Text>
                </View>
                <Text className="text-gray-600 text-xs">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} className="items-center p-3">
                <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mb-1">
                  <Text className="text-xl">🗑️</Text>
                </View>
                <Text className="text-gray-600 text-xs">Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Client Details */}
          <Card style={{ marginBottom: 16 }}>
            <Text className="text-lg font-bold text-gray-800 mb-4">Details</Text>
            <DetailRow label="Phone" value={client.phoneNumber} icon="📱" />
            <DetailRow label="Business Type" value={businessType?.label} icon="🏢" />
            <DetailRow label="Using System" value={client.usingSystem === 'yes' ? 'Yes' : 'No'} icon="💻" />
            {client.location && (
              <DetailRow 
                label="Location" 
                value={`${client.location.latitude.toFixed(4)}, ${client.location.longitude.toFixed(4)}`} 
                icon="📍" 
              />
            )}
            {client.address && <DetailRow label="Address" value={client.address} icon="🏠" />}
            <DetailRow label="Added" value={formatDate(client.createdAt)} icon="📅" />
          </Card>

          {/* Interactions */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-800">Interactions</Text>
              <Button title="+ Add" onPress={handleAddInteraction} size="small" fullWidth={false} />
            </View>
            {interactions.length === 0 ? (
              <Card><Text className="text-gray-500 text-center py-4">No interactions yet</Text></Card>
            ) : (
              interactions.map((interaction) => (
                <InteractionCard key={interaction.id} interaction={interaction} onDelete={removeInteraction} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value, icon }) => (
  <View className="flex-row items-center py-2 border-b border-gray-50">
    <Text className="mr-2">{icon}</Text>
    <Text className="text-gray-500 w-24">{label}</Text>
    <Text className="text-gray-800 flex-1">{value || 'N/A'}</Text>
  </View>
);

export default ClientDetailScreen;

