import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Card from '../common/Card';
import { getInitials, getPotentialColor, makePhoneCall, sendSMS, getBusinessTypeIcon } from '../../utils/helpers';
import { BUSINESS_TYPES } from '../../utils/constants';

const ClientCard = ({ client, onPress, onCall, onMessage }) => {
  const businessType = BUSINESS_TYPES.find((b) => b.value === client.businessType);
  const potentialColor = getPotentialColor(client.customerPotential);
  const businessIcon = getBusinessTypeIcon(client.businessType);

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
            <Text style={styles.businessType}>{businessIcon} {businessType?.label || 'N/A'}</Text>
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
    color: '#2a2e3a',
  },
  companyName: {
    color: '#7c85a0',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  businessType: {
    color: '#a8b0c8',
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
    backgroundColor: '#e8e3fc',
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
    borderTopColor: '#eceff8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    color: '#a8b0c8',
    fontSize: 14,
  },
  locationText: {
    color: '#a8b0c8',
    fontSize: 14,
    marginLeft: 16,
  },
});

export default ClientCard;

