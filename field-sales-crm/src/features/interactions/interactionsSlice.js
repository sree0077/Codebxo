import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/constants';
import { generateId } from '../../utils/helpers';

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

// Helper to get storage key
const getInteractionStorageKey = (userId) => `${STORAGE_KEYS.INTERACTIONS}_${userId}`;

// Load interactions for user
export const loadInteractions = createAsyncThunk(
  'interactions/loadInteractions',
  async (userId, { rejectWithValue }) => {
    try {
      const interactionsJson = await AsyncStorage.getItem(getInteractionStorageKey(userId));
      return interactionsJson ? JSON.parse(interactionsJson) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add new interaction
export const addInteraction = createAsyncThunk(
  'interactions/addInteraction',
  async ({ userId, interactionData }, { getState, rejectWithValue }) => {
    try {
      const newInteraction = {
        ...interactionData,
        id: generateId(),
        userId,
        createdAt: new Date().toISOString(),
      };
      const { interactions } = getState();
      const updatedInteractions = [newInteraction, ...interactions.items];
      await AsyncStorage.setItem(
        getInteractionStorageKey(userId),
        JSON.stringify(updatedInteractions)
      );
      return newInteraction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update interaction
export const updateInteraction = createAsyncThunk(
  'interactions/updateInteraction',
  async ({ userId, interactionId, interactionData }, { getState, rejectWithValue }) => {
    try {
      const { interactions } = getState();
      const updatedInteractions = interactions.items.map((interaction) =>
        interaction.id === interactionId
          ? { ...interaction, ...interactionData }
          : interaction
      );
      await AsyncStorage.setItem(
        getInteractionStorageKey(userId),
        JSON.stringify(updatedInteractions)
      );
      return { interactionId, interactionData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete interaction
export const deleteInteraction = createAsyncThunk(
  'interactions/deleteInteraction',
  async ({ userId, interactionId }, { getState, rejectWithValue }) => {
    try {
      const { interactions } = getState();
      const updatedInteractions = interactions.items.filter((i) => i.id !== interactionId);
      await AsyncStorage.setItem(
        getInteractionStorageKey(userId),
        JSON.stringify(updatedInteractions)
      );
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

