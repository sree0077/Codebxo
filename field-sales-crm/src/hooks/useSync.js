import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { processSyncQueue, setupSyncListeners, isOnline as checkIsOnline } from '../services/syncService';
import { loadClients } from '../features/clients/clientsSlice';
import { loadInteractions } from '../features/interactions/interactionsSlice';
import { useAuth } from './useAuth';

/**
 * Hook to manage offline sync operations
 * Automatically syncs data when device comes online
 */
export const useSync = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(checkIsOnline());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const hasInitialSynced = useRef(false); // Track if initial sync has happened

  // Sync data with Firebase
  const syncData = useCallback(async () => {
    if (!user?.id || !isOnline) {
      console.log('[SYNC] ⚠️ Cannot sync: user not authenticated or offline');
      return { success: false };
    }

    if (isSyncing) {
      console.log('[SYNC] ⚠️ Sync already in progress, skipping...');
      return { success: false, message: 'Sync in progress' };
    }

    setIsSyncing(true);
    console.log('[SYNC] 🔄 Starting sync...');

    try {
      // Process sync queue (pending offline operations)
      const result = await processSyncQueue();
      console.log('[SYNC] ✅ Sync queue processed:', result);

      // Small delay to ensure Firebase has processed everything
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reload data from Firebase to get fresh data with real IDs
      // This will also clean up temp IDs from local storage
      console.log('[SYNC] 🔄 Reloading data from Firebase...');
      await dispatch(loadClients(user.id));
      await dispatch(loadInteractions(user.id));

      setLastSyncTime(new Date());
      console.log('[SYNC] ✅ Sync completed successfully');

      return { success: true, ...result };
    } catch (error) {
      console.error('[SYNC] ❌ Sync failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  }, [dispatch, user?.id, isOnline, isSyncing]);

  // Setup online/offline listeners (only once on mount)
  useEffect(() => {
    const handleOnline = async () => {
      console.log('[SYNC] 🌐 Device is online');
      setIsOnline(true);
      // Auto-sync when coming online (only if user is logged in)
      if (user?.id && !isSyncing) {
        await syncData();
      }
    };

    const handleOffline = () => {
      console.log('[SYNC] 📴 Device is offline');
      setIsOnline(false);
    };

    // Setup listeners only for web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Cleanup
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // For mobile platforms, we don't need online/offline listeners
      console.log('[SYNC] 📱 Mobile platform - skipping network event listeners');
    }
  }, []); // Empty deps - setup once, use latest values via closure

  // Initial sync when user logs in (only once per user)
  useEffect(() => {
    if (isOnline && user?.id && !hasInitialSynced.current && !isSyncing) {
      hasInitialSynced.current = true;
      console.log('[SYNC] 🔄 Initial sync for user:', user.id);
      syncData();
    }

    // Reset flag when user logs out
    if (!user?.id) {
      hasInitialSynced.current = false;
    }
  }, [user?.id]); // Only run when user ID changes, NOT when syncData changes

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncData,
  };
};

