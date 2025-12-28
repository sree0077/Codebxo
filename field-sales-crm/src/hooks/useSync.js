import { useEffect, useState, useCallback } from 'react';
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

  // Handle online event
  const handleOnline = useCallback(() => {
    console.log('[SYNC] 🌐 Device is online');
    setIsOnline(true);
    // Auto-sync when coming online
    syncData();
  }, [syncData]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    console.log('[SYNC] 📴 Device is offline');
    setIsOnline(false);
  }, []);

  // Setup online/offline listeners
  useEffect(() => {
    setupSyncListeners(handleOnline, handleOffline);
    
    // Initial sync if online
    if (isOnline && user?.id) {
      syncData();
    }
  }, [handleOnline, handleOffline, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncData,
  };
};

