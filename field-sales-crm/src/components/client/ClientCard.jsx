import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    <Card onPress={onPress} variant="elevated" style={{ marginBottom: 12 }}>
      <View className="flex-row items-center">
        {/* Avatar */}
        <View
          className="w-14 h-14 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: potentialColor + '20' }}
        >
          <Text className="text-lg font-bold" style={{ color: potentialColor }}>
            {getInitials(client.clientName)}
          </Text>
        </View>

        {/* Client Info */}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
            {client.clientName}
          </Text>
          {client.companyName && (
            <Text className="text-gray-500 text-sm" numberOfLines={1}>
              {client.companyName}
            </Text>
          )}
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-400 text-xs">📍 {businessType?.label || 'N/A'}</Text>
            {client.customerPotential && (
              <View
                className="ml-2 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: potentialColor + '20' }}
              >
                <Text className="text-xs font-medium capitalize" style={{ color: potentialColor }}>
                  {client.customerPotential}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row">
          <TouchableOpacity
            onPress={handleCall}
            className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-2"
          >
            <Text className="text-lg">📞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMessage}
            className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center"
          >
            <Text className="text-lg">💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Phone Number */}
      <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center">
        <Text className="text-gray-400 text-sm">📱 {client.phoneNumber}</Text>
        {client.location && (
          <Text className="text-gray-400 text-sm ml-4">
            📍 {client.location.latitude.toFixed(4)}, {client.location.longitude.toFixed(4)}
          </Text>
        )}
      </View>
    </Card>
  );
};

export default ClientCard;

