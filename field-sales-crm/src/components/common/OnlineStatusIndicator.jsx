import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSync } from '../../hooks/useSync';

/**
 * Visual indicator showing online/offline status and sync state
 * Useful for testing offline functionality
 */
const OnlineStatusIndicator = () => {
  const { isOnline, isSyncing, lastSyncTime } = useSync();

  const getStatusColor = () => {
    if (isSyncing) return '#f59e0b'; // Orange when syncing
    if (isOnline) return '#10b981'; // Green when online
    return '#ef4444'; // Red when offline
  };

  const getStatusText = () => {
    if (isSyncing) return '🔄 Syncing...';
    if (isOnline) return '🌐 Online';
    return '📴 Offline';
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - lastSyncTime) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastSyncTime.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <View style={styles.textContainer}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        {lastSyncTime && (
          <Text style={styles.syncText}>Last sync: {formatLastSync()}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  syncText: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default OnlineStatusIndicator;

