import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Card from '../common/Card';
import { getInitials, getPotentialColor, makePhoneCall, sendSMS } from '../../utils/helpers';
import { BUSINESS_TYPES } from '../../utils/constants';

const ClientCard = ({ client, onPress, onCall, onMessage }) => {
  const businessType = BUSINESS_TYPES.find((b) => b.value === client.businessType);
  const potentialColor = getPotentialColor(client.customerPotential);

  const handleCall = () => {
    if (client.phoneNumber) {
      makePhoneCall(client.phoneNumber);
      onCall?.(client);
    }
  };

  const handleMessage = () => {
    if (client.phoneNumber) {
      sendSMS(client.phoneNumber);
      onMessage?.(client);
    }
  };

  return (
    <Card onPress={onPress} variant="elevated" style={styles.cardContainer}>
      <View style={styles.container}>
        {/* Avatar */}
        <View
          style={[styles.avatar, { backgroundColor: potentialColor + '20' }]}
        >
          <Text style={[styles.avatarText, { color: potentialColor }]}>
            {getInitials(client.clientName)}
          </Text>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <Text style={styles.clientName} numberOfLines={1}>
            {client.clientName}
          </Text>
          {client.companyName && (
            <Text style={styles.companyName} numberOfLines={1}>
              {client.companyName}
            </Text>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.businessType}>📍 {businessType?.label || 'N/A'}</Text>
            {client.customerPotential && (
              <View
                style={[styles.potentialBadge, { backgroundColor: potentialColor + '20' }]}
              >
                <Text style={[styles.potentialText, { color: potentialColor }]}>
                  {client.customerPotential}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={handleCall}
            style={styles.callButton}
          >
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMessage}
            style={styles.messageButton}
          >
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Phone Number */}
      <View style={styles.footer}>
        <Text style={styles.phoneText}>📱 {client.phoneNumber}</Text>
        {client.location && (
          <Text style={styles.locationText}>
            📍 {client.location.latitude.toFixed(4)}, {client.location.longitude.toFixed(4)}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  companyName: {
    color: '#6b7280',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  businessType: {
    color: '#9ca3af',
    fontSize: 12,
  },
  potentialBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  potentialText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 18,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  locationText: {
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 16,
  },
});

export default ClientCard;

