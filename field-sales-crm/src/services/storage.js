import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Storage Service
 * Provides unified storage interface for both mobile (AsyncStorage) and web (localStorage)
 * Supports offline data persistence and sync queue management
 */

const STORAGE_KEYS = {
  CLIENTS: '@field_sales_crm/clients',
  INTERACTIONS: '@field_sales_crm/interactions',
  SYNC_QUEUE: '@field_sales_crm/sync_queue',
  LAST_SYNC: '@field_sales_crm/last_sync',
};

// Web storage wrapper for localStorage
const webStorage = {
  async getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('[STORAGE] Web getItem error:', error);
      return null;
    }
  },
  async setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('[STORAGE] Web setItem error:', error);
    }
  },
  async removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[STORAGE] Web removeItem error:', error);
    }
  },
  async getAllKeys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('[STORAGE] Web getAllKeys error:', error);
      return [];
    }
  },
};

// Use AsyncStorage for mobile, localStorage wrapper for web
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

/**
 * Save data to local storage
 */
export const saveToStorage = async (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    await storage.setItem(key, jsonData);
    console.log(`[STORAGE] ✅ Saved ${key}`);
    return { success: true };
  } catch (error) {
    console.error(`[STORAGE] ❌ Error saving ${key}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Load data from local storage
 */
export const loadFromStorage = async (key) => {
  try {
    const jsonData = await storage.getItem(key);
    if (jsonData) {
      const data = JSON.parse(jsonData);
      console.log(`[STORAGE] ✅ Loaded ${key}`);
      return { success: true, data };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error(`[STORAGE] ❌ Error loading ${key}:`, error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Remove data from local storage
 */
export const removeFromStorage = async (key) => {
  try {
    await storage.removeItem(key);
    console.log(`[STORAGE] ✅ Removed ${key}`);
    return { success: true };
  } catch (error) {
    console.error(`[STORAGE] ❌ Error removing ${key}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all app data from storage
 */
export const clearAllStorage = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map(key => storage.removeItem(key)));
    console.log('[STORAGE] ✅ Cleared all storage');
    return { success: true };
  } catch (error) {
    console.error('[STORAGE] ❌ Error clearing storage:', error);
    return { success: false, error: error.message };
  }
};

// Client Storage Operations
export const saveClients = (userId, clients) => saveToStorage(`${STORAGE_KEYS.CLIENTS}_${userId}`, clients);
export const loadClients = (userId) => loadFromStorage(`${STORAGE_KEYS.CLIENTS}_${userId}`);
export const clearClients = (userId) => removeFromStorage(`${STORAGE_KEYS.CLIENTS}_${userId}`);

// Interaction Storage Operations
export const saveInteractions = (userId, interactions) => saveToStorage(`${STORAGE_KEYS.INTERACTIONS}_${userId}`, interactions);
export const loadInteractions = (userId) => loadFromStorage(`${STORAGE_KEYS.INTERACTIONS}_${userId}`);
export const clearInteractions = (userId) => removeFromStorage(`${STORAGE_KEYS.INTERACTIONS}_${userId}`);

// Sync Queue Operations
export const addToSyncQueue = async (userId, operation) => {
  try {
    const key = `${STORAGE_KEYS.SYNC_QUEUE}_${userId}`;
    const result = await loadFromStorage(key);
    const queue = result.data || [];
    queue.push({ ...operation, timestamp: Date.now() });
    await saveToStorage(key, queue);
    console.log('[STORAGE] ✅ Added to sync queue:', operation.type);
    return { success: true };
  } catch (error) {
    console.error('[STORAGE] ❌ Error adding to sync queue:', error);
    return { success: false, error: error.message };
  }
};

export const getSyncQueue = (userId) => loadFromStorage(`${STORAGE_KEYS.SYNC_QUEUE}_${userId}`);
export const clearSyncQueue = (userId) => saveToStorage(`${STORAGE_KEYS.SYNC_QUEUE}_${userId}`, []);

// Last Sync Timestamp
export const saveLastSyncTime = (userId) => saveToStorage(`${STORAGE_KEYS.LAST_SYNC}_${userId}`, Date.now());
export const getLastSyncTime = (userId) => loadFromStorage(`${STORAGE_KEYS.LAST_SYNC}_${userId}`);

export { STORAGE_KEYS };

