import { Platform } from 'react-native';
import {
  addClient as firebaseAddClient,
  updateClient as firebaseUpdateClient,
  deleteClient as firebaseDeleteClient,
  addInteraction as firebaseAddInteraction,
  updateInteraction as firebaseUpdateInteraction,
  deleteInteraction as firebaseDeleteInteraction,
} from './firebase';
import {
  getSyncQueue,
  clearSyncQueue,
  addToSyncQueue,
  saveLastSyncTime,
} from './storage';

/**
 * Sync Service
 * Handles synchronization between local storage and Firebase
 * Manages offline operations queue
 */

/**
 * Check if device is online
 */
export const isOnline = () => {
  // For web platform, use navigator.onLine
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.onLine !== undefined) {
    return navigator.onLine;
  }
  // For mobile platforms (iOS/Android), assume online by default
  // Network state will be managed by the app's network listeners
  return true;
};

/**
 * Process sync queue - sync all pending operations to Firebase
 */
export const processSyncQueue = async (userId) => {
  if (!userId) {
    console.error('[SYNC] ❌ Missing userId for sync');
    return { success: false, error: 'Missing userId' };
  }

  if (!isOnline()) {
    console.log('[SYNC] ⚠️ Device is offline, skipping sync');
    return { success: false, error: 'Device is offline' };
  }

  try {
    const result = await getSyncQueue(userId);
    const queue = result.data || [];

    if (queue.length === 0) {
      console.log('[SYNC] ✅ No pending operations to sync');
      return { success: true, synced: 0 };
    }

    console.log(`[SYNC] 🔄 Processing ${queue.length} pending operations for user ${userId}...`);

    let successCount = 0;
    let failedOperations = [];

    for (const operation of queue) {
      try {
        await processOperation(operation);
        successCount++;
      } catch (error) {
        console.error('[SYNC] ❌ Failed to process operation:', operation, error);
        failedOperations.push(operation);
      }
    }

    // Keep failed operations in queue
    if (failedOperations.length > 0) {
      await clearSyncQueue(userId);
      for (const op of failedOperations) {
        await addToSyncQueue(userId, op);
      }
    } else {
      await clearSyncQueue(userId);
    }

    await saveLastSyncTime(userId);

    console.log(`[SYNC] ✅ Synced ${successCount}/${queue.length} operations`);
    return { success: true, synced: successCount, failed: failedOperations.length };
  } catch (error) {
    console.error('[SYNC] ❌ Error processing sync queue:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Process a single sync operation
 */
const processOperation = async (operation) => {
  const { type, data } = operation;

  switch (type) {
    case 'ADD_CLIENT':
      return await firebaseAddClient(data);
    case 'UPDATE_CLIENT':
      return await firebaseUpdateClient(data.id, data);
    case 'DELETE_CLIENT':
      return await firebaseDeleteClient(data.id);
    case 'ADD_INTERACTION':
      return await firebaseAddInteraction(data);
    case 'UPDATE_INTERACTION':
      return await firebaseUpdateInteraction(data.id, data);
    case 'DELETE_INTERACTION':
      return await firebaseDeleteInteraction(data.id);
    default:
      throw new Error(`Unknown operation type: ${type}`);
  }
};

/**
 * Queue an operation for later sync (when offline)
 */
export const queueOperation = async (userId, type, data) => {
  if (!userId) return { success: false, error: 'Missing userId' };
  console.log(`[SYNC] 📝 Queuing operation: ${type} for user ${userId}`);
  return await addToSyncQueue(userId, { type, data });
};

/**
 * Execute operation immediately if online, queue if offline
 */
export const executeOrQueue = async (userId, type, data, executeFunction) => {
  if (isOnline()) {
    try {
      const result = await executeFunction();
      return result;
    } catch (error) {
      // If online operation fails, queue it
      console.log('[SYNC] ⚠️ Online operation failed, queuing for later');
      await queueOperation(userId, type, data);
      return { success: false, error: error.message, queued: true };
    }
  } else {
    // Queue for later sync
    await queueOperation(userId, type, data);
    return { success: true, queued: true };
  }
};

/**
 * Setup online/offline event listeners
 */
export const setupSyncListeners = (onOnline, onOffline) => {
  // Only setup listeners for web platform
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', () => {
      console.log('[SYNC] 🌐 Device is online');
      if (onOnline) onOnline();
    });

    window.addEventListener('offline', () => {
      console.log('[SYNC] 📴 Device is offline');
      if (onOffline) onOffline();
    });
  } else {
    // For mobile platforms, we don't set up listeners
    // The app will assume it's always online and handle network errors gracefully
    console.log('[SYNC] 📱 Mobile platform detected - network listeners not required');
  }
};

