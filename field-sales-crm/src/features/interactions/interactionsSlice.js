import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addInteraction as firebaseAddInteraction,
  updateInteraction as firebaseUpdateInteraction,
  deleteInteraction as firebaseDeleteInteraction,
  getInteractionsByUser
} from '../../services/firebase';

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

// Load interactions for user from Firestore
export const loadInteractions = createAsyncThunk(
  'interactions/loadInteractions',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await getInteractionsByUser(userId);
      if (result.success) {
        return result.interactions.map(interaction => ({
          ...interaction,
          createdAt: interaction.createdAt?.toDate?.()?.toISOString() || interaction.createdAt,
        }));
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add new interaction to Firestore
export const addInteraction = createAsyncThunk(
  'interactions/addInteraction',
  async ({ userId, interactionData }, { rejectWithValue }) => {
    try {
      const result = await firebaseAddInteraction({
        ...interactionData,
        userId,
      });
      if (result.success) {
        return {
          ...interactionData,
          id: result.id,
          userId,
          createdAt: new Date().toISOString(),
        };
      }
      throw new Error(result.error || 'Failed to add interaction');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update interaction in Firestore
export const updateInteraction = createAsyncThunk(
  'interactions/updateInteraction',
  async ({ userId, interactionId, interactionData }, { rejectWithValue }) => {
    try {
      const result = await firebaseUpdateInteraction(interactionId, interactionData);
      if (result.success) {
        return { interactionId, interactionData };
      }
      throw new Error(result.error || 'Failed to update interaction');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete interaction from Firestore
export const deleteInteraction = createAsyncThunk(
  'interactions/deleteInteraction',
  async ({ userId, interactionId }, { rejectWithValue }) => {
    try {
      const result = await firebaseDeleteInteraction(interactionId);
      if (result.success) {
        return interactionId;
      }
      throw new Error(result.error || 'Failed to delete interaction');
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
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(loadInteractions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Interaction
      .addCase(addInteraction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
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

