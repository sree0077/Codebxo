import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Card from '../common/Card';
import { getInteractionIcon, formatDateTime, formatDate } from '../../utils/helpers';

const InteractionCard = ({ interaction, onPress, onDelete }) => {
  const icon = getInteractionIcon(interaction.type);

  const getTypeColor = () => {
    switch (interaction.type) {
      case 'call':
        return '#22c55e';
      case 'message':
        return '#7f68ea';
      case 'meeting':
        return '#9b87f0';
      default:
        return '#7c85a0';
    }
  };

  return (
    <Card onPress={onPress} style={styles.cardContainer}>
      <View style={styles.container}>
        {/* Icon */}
        <View
          style={[styles.iconContainer, { backgroundColor: getTypeColor() + '20' }]}
        >
          <Text style={styles.iconText}>{icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[styles.typeText, { color: getTypeColor() }]}
            >
              {interaction.type}
            </Text>
            <Text style={styles.dateText}>
              {formatDateTime(interaction.createdAt)}
            </Text>
          </View>

          <Text style={styles.notesText} numberOfLines={2}>
            {interaction.notes}
          </Text>

          {interaction.clientReply && (
            <View style={styles.replyContainer}>
              <Text style={styles.replyLabel}>Client Reply:</Text>
              <Text style={styles.replyText} numberOfLines={2}>
                {interaction.clientReply}
              </Text>
            </View>
          )}

          {interaction.followUpDate && (
            <View style={styles.followUpContainer}>
              <Text style={styles.followUpText}>
                📅 Follow-up: {formatDate(interaction.followUpDate)}
              </Text>
            </View>
          )}
        </View>

        {/* Delete Button */}
        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(interaction.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
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
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  notesText: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 8,
  },
  replyContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  replyLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  replyText: {
    color: '#374151',
    fontSize: 14,
  },
  followUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followUpText: {
    color: '#f97316',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    color: '#9ca3af',
  },
});

export default InteractionCard;

