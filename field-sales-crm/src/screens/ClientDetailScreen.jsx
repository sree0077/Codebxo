import React, { useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
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
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Client not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(client.clientName)}
              </Text>
            </View>
            <Text style={styles.clientName}>{client.clientName}</Text>
            {client.companyName && (
              <Text style={styles.companyName}>{client.companyName}</Text>
            )}
            {potential && (
              <View style={styles.potentialBadge}>
                <Text style={styles.potentialText}>{potential.label} Potential</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Quick Actions */}
          <Card style={styles.cardMargin}>
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={() => makePhoneCall(client.phoneNumber)} style={styles.actionButton}>
                <View style={[styles.actionIcon, styles.greenBg]}>
                  <Text style={styles.actionEmoji}>📞</Text>
                </View>
                <Text style={styles.actionLabel}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendSMS(client.phoneNumber)} style={styles.actionButton}>
                <View style={[styles.actionIcon, styles.blueBg]}>
                  <Text style={styles.actionEmoji}>💬</Text>
                </View>
                <Text style={styles.actionLabel}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                <View style={[styles.actionIcon, styles.orangeBg]}>
                  <Text style={styles.actionEmoji}>✏️</Text>
                </View>
                <Text style={styles.actionLabel}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <View style={[styles.actionIcon, styles.redBg]}>
                  <Text style={styles.actionEmoji}>🗑️</Text>
                </View>
                <Text style={styles.actionLabel}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Client Details */}
          <Card style={styles.cardMargin}>
            <Text style={styles.sectionTitle}>Details</Text>
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
          <View style={styles.interactionsSection}>
            <View style={styles.interactionsHeader}>
              <Text style={styles.sectionTitle}>Interactions</Text>
              <Button title="+ Add" onPress={handleAddInteraction} size="small" fullWidth={false} />
            </View>
            {interactions.length === 0 ? (
              <Card><Text style={styles.emptyText}>No interactions yet</Text></Card>
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
  <View style={styles.detailRow}>
    <Text style={styles.detailIcon}>{icon}</Text>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  header: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  clientName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  companyName: {
    color: '#bfdbfe',
    fontSize: 14,
  },
  potentialBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  potentialText: {
    color: '#ffffff',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  content: {
    paddingHorizontal: 16,
    marginTop: -16,
  },
  cardMargin: {
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  greenBg: {
    backgroundColor: '#d1fae5',
  },
  blueBg: {
    backgroundColor: '#dbeafe',
  },
  orangeBg: {
    backgroundColor: '#fed7aa',
  },
  redBg: {
    backgroundColor: '#fecaca',
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionLabel: {
    color: '#4b5563',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  detailIcon: {
    marginRight: 8,
  },
  detailLabel: {
    color: '#6b7280',
    width: 96,
  },
  detailValue: {
    color: '#1f2937',
    flex: 1,
  },
  interactionsSection: {
    marginBottom: 16,
  },
  interactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default ClientDetailScreen;

