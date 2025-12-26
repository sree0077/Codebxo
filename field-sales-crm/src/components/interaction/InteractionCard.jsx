import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Card from '../common/Card';
import { getInteractionIcon, formatDateTime, formatDate } from '../../utils/helpers';

const InteractionCard = ({ interaction, onPress, onDelete }) => {
  const icon = getInteractionIcon(interaction.type);

  const getTypeColor = () => {
    switch (interaction.type) {
      case 'call':
        return '#22c55e';
      case 'message':
        return '#3b82f6';
      case 'meeting':
        return '#8b5cf6';
      default:
        return '#64748b';
    }
  };

  return (
    <Card onPress={onPress} style={{ marginBottom: 12 }}>
      <View className="flex-row items-start">
        {/* Icon */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: getTypeColor() + '20' }}
        >
          <Text className="text-xl">{icon}</Text>
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="text-base font-semibold capitalize"
              style={{ color: getTypeColor() }}
            >
              {interaction.type}
            </Text>
            <Text className="text-gray-400 text-xs">
              {formatDateTime(interaction.createdAt)}
            </Text>
          </View>

          <Text className="text-gray-700 text-sm mb-2" numberOfLines={2}>
            {interaction.notes}
          </Text>

          {interaction.clientReply && (
            <View className="bg-gray-50 rounded-lg p-2 mb-2">
              <Text className="text-gray-500 text-xs mb-1">Client Reply:</Text>
              <Text className="text-gray-700 text-sm" numberOfLines={2}>
                {interaction.clientReply}
              </Text>
            </View>
          )}

          {interaction.followUpDate && (
            <View className="flex-row items-center">
              <Text className="text-orange-500 text-xs">
                📅 Follow-up: {formatDate(interaction.followUpDate)}
              </Text>
            </View>
          )}
        </View>

        {/* Delete Button */}
        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(interaction.id)}
            className="p-2"
          >
            <Text className="text-gray-400">🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

export default InteractionCard;

