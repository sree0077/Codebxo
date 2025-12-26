import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadInteractions,
  addInteraction,
  updateInteraction,
  deleteInteraction,
} from '../features/interactions/interactionsSlice';

export const useInteractions = () => {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.interactions);
  const { user } = useSelector((state) => state.auth);

  // Load interactions when user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(loadInteractions(user.id));
    }
  }, [dispatch, user?.id]);

  // Get interactions for a specific client
  const getClientInteractions = useCallback(
    (clientId) => {
      return items
        .filter((interaction) => interaction.clientId === clientId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    [items]
  );

  // Get upcoming follow-ups
  const upcomingFollowups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return items
      .filter((interaction) => {
        if (!interaction.followUpDate) return false;
        const followUpDate = new Date(interaction.followUpDate);
        followUpDate.setHours(0, 0, 0, 0);
        return followUpDate >= today;
      })
      .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
  }, [items]);

  // Add new interaction
  const createInteraction = useCallback(
    async (interactionData) => {
      if (!user?.id) return { success: false, error: 'User not authenticated' };
      const result = await dispatch(addInteraction({ userId: user.id, interactionData }));
      return { success: !result.error, error: result.error?.message };
    },
    [dispatch, user?.id]
  );

  // Update existing interaction
  const editInteraction = useCallback(
    async (interactionId, interactionData) => {
      if (!user?.id) return { success: false, error: 'User not authenticated' };
      const result = await dispatch(
        updateInteraction({ userId: user.id, interactionId, interactionData })
      );
      return { success: !result.error, error: result.error?.message };
    },
    [dispatch, user?.id]
  );

  // Delete interaction
  const removeInteraction = useCallback(
    async (interactionId) => {
      if (!user?.id) return { success: false, error: 'User not authenticated' };
      const result = await dispatch(deleteInteraction({ userId: user.id, interactionId }));
      return { success: !result.error, error: result.error?.message };
    },
    [dispatch, user?.id]
  );

  // Refresh interactions
  const refreshInteractions = useCallback(() => {
    if (user?.id) {
      dispatch(loadInteractions(user.id));
    }
  }, [dispatch, user?.id]);

  return {
    interactions: items,
    isLoading,
    error,
    upcomingFollowups,
    getClientInteractions,
    createInteraction,
    editInteraction,
    removeInteraction,
    refreshInteractions,
  };
};

export default useInteractions;

