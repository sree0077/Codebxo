import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addInteraction as firebaseAddInteraction,
  updateInteraction as firebaseUpdateInteraction,
  deleteInteraction as firebaseDeleteInteraction,
  getInteractionsByUser
} from '../../services/firebase';
import {
  saveInteractions,
  loadInteractions as loadInteractionsFromStorage,
} from '../../services/storage';
import { executeOrQueue, isOnline } from '../../services/syncService';

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

// Load interactions for user from Firestore or local storage
export const loadInteractions = createAsyncThunk(
  'interactions/loadInteractions',
  async (userId) => {
    try {
      // Try to load from Firebase if online
      if (isOnline()) {
        const result = await getInteractionsByUser(userId);
        if (result.success) {
          const interactions = result.interactions.map(interaction => ({
            ...interaction,
            createdAt: interaction.createdAt?.toDate?.()?.toISOString() || interaction.createdAt,
          }));
          // Save to local storage for offline access
          await saveInteractions(userId, interactions);
          console.log('[INTERACTIONS] ✅ Loaded from Firebase and saved to local storage');
          return interactions;
        }
      }

      // If offline or Firebase failed, load from local storage
      console.log('[INTERACTIONS] 📴 Loading from local storage (offline mode)');
      const storageResult = await loadInteractionsFromStorage(userId);
      return storageResult.data || [];
    } catch (error) {
      console.error('[INTERACTIONS] ❌ Error loading interactions:', error);
      // Fallback to local storage
      const storageResult = await loadInteractionsFromStorage(userId);
      return storageResult.data || [];
    }
  }
);

// Add new interaction to Firestore (with offline support)
export const addInteraction = createAsyncThunk(
  'interactions/addInteraction',
  async ({ userId, interactionData }, { rejectWithValue, getState }) => {
    try {
      const tempId = `temp_${Date.now()}`;
      const newInteraction = {
        ...interactionData,
        id: tempId,
        userId,
        createdAt: new Date().toISOString(),
        _offline: !isOnline(),
      };

      if (isOnline()) {
        const result = await firebaseAddInteraction({
          ...interactionData,
          userId,
        });
        if (result.success) {
          newInteraction.id = result.id;
          newInteraction._offline = false;
        }
      } else {
        // Queue for sync when online
        await executeOrQueue(userId, 'ADD_INTERACTION', { ...interactionData, userId }, () => { });
        console.log('[INTERACTIONS] 📴 Interaction queued for sync');
      }

      // Save updated interactions to local storage
      const state = getState();
      const updatedInteractions = [newInteraction, ...state.interactions.items];
      await saveInteractions(userId, updatedInteractions);

      return newInteraction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update interaction in Firestore (with offline support)
export const updateInteraction = createAsyncThunk(
  'interactions/updateInteraction',
  async ({ userId, interactionId, interactionData }, { rejectWithValue, getState }) => {
    try {
      if (isOnline()) {
        const result = await firebaseUpdateInteraction(interactionId, interactionData);
        if (!result.success) {
          throw new Error(result.error || 'Failed to update interaction');
        }
      } else {
        // Queue for sync when online
        await executeOrQueue(userId, 'UPDATE_INTERACTION', { id: interactionId, ...interactionData }, () => { });
        console.log('[INTERACTIONS] 📴 Interaction update queued for sync');
      }

      // Save updated interactions to local storage
      const state = getState();
      const updatedInteractions = state.interactions.items.map(i =>
        i.id === interactionId ? { ...i, ...interactionData } : i
      );
      await saveInteractions(userId, updatedInteractions);

      return { interactionId, interactionData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete interaction from Firestore (with offline support)
export const deleteInteraction = createAsyncThunk(
  'interactions/deleteInteraction',
  async ({ userId, interactionId }, { rejectWithValue, getState }) => {
    try {
      if (isOnline()) {
        const result = await firebaseDeleteInteraction(interactionId);
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete interaction');
        }
      } else {
        // Queue for sync when online
        await executeOrQueue(userId, 'DELETE_INTERACTION', { id: interactionId }, () => { });
        console.log('[INTERACTIONS] 📴 Interaction deletion queued for sync');
      }

      // Save updated interactions to local storage
      const state = getState();
      const updatedInteractions = state.interactions.items.filter(i => i.id !== interactionId);
      await saveInteractions(userId, updatedInteractions);

      return interactionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get interactions for a specific client
export const getClientInteractions = (state, clientId) => {
  return state.interactions.items.filter((i) => i.clientId === clientId);
};

const interactionsSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    clearInteractions: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Interactions
      .addCase(loadInteractions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadInteractions.fulfilled, (state, action) => {
        console.log('[INTERACTIONS] 📥 loadInteractions.fulfilled - Received', action.payload.length, 'interactions');

        // Simply replace with fresh data from Firebase/storage
        // Filter out any temp IDs that might be in the payload
        const freshData = action.payload.filter(item => !item.id?.startsWith('temp_'));

        // Remove duplicates by ID (keep first occurrence)
        const uniqueInteractions = [];
        const seenIds = new Set();

        for (const interaction of freshData) {
          if (!seenIds.has(interaction.id)) {
            seenIds.add(interaction.id);
            uniqueInteractions.push(interaction);
          } else {
            console.warn('[INTERACTIONS] ⚠️ Duplicate ID found:', interaction.id);
          }
        }

        state.items = uniqueInteractions;
        state.isLoading = false;

        console.log('[INTERACTIONS] ✅ Final state:', uniqueInteractions.length, 'unique interactions');
      })
      .addCase(loadInteractions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Interaction
      .addCase(addInteraction.fulfilled, (state, action) => {
        // Check if interaction already exists (prevent duplicates)
        const exists = state.items.some(item => item.id === action.payload.id);
        if (!exists) {
          state.items.unshift(action.payload);
        }
      })
      // Update Interaction
      .addCase(updateInteraction.fulfilled, (state, action) => {
        const { interactionId, interactionData } = action.payload;
        const index = state.items.findIndex((i) => i.id === interactionId);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...interactionData };
        }
      })
      // Delete Interaction
      .addCase(deleteInteraction.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export const { clearInteractions } = interactionsSlice.actions;
export default interactionsSlice.reducer;

