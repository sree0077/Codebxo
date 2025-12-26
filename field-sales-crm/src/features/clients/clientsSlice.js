import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/constants';
import { generateId } from '../../utils/helpers';

const initialState = {
  items: [],
  selectedClient: null,
  isLoading: false,
  error: null,
  searchQuery: '',
};

// Helper to get storage key for user
const getClientStorageKey = (userId) => `${STORAGE_KEYS.CLIENTS}_${userId}`;

// Load clients for user
export const loadClients = createAsyncThunk(
  'clients/loadClients',
  async (userId, { rejectWithValue }) => {
    try {
      const clientsJson = await AsyncStorage.getItem(getClientStorageKey(userId));
      return clientsJson ? JSON.parse(clientsJson) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add new client
export const addClient = createAsyncThunk(
  'clients/addClient',
  async ({ userId, clientData }, { getState, rejectWithValue }) => {
    try {
      const newClient = {
        ...clientData,
        id: generateId(),
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const { clients } = getState();
      const updatedClients = [newClient, ...clients.items];
      await AsyncStorage.setItem(getClientStorageKey(userId), JSON.stringify(updatedClients));
      return newClient;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update client
export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ userId, clientId, clientData }, { getState, rejectWithValue }) => {
    try {
      const { clients } = getState();
      const updatedClients = clients.items.map((client) =>
        client.id === clientId
          ? { ...client, ...clientData, updatedAt: new Date().toISOString() }
          : client
      );
      await AsyncStorage.setItem(getClientStorageKey(userId), JSON.stringify(updatedClients));
      return { clientId, clientData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete client
export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async ({ userId, clientId }, { getState, rejectWithValue }) => {
    try {
      const { clients } = getState();
      const updatedClients = clients.items.filter((client) => client.id !== clientId);
      await AsyncStorage.setItem(getClientStorageKey(userId), JSON.stringify(updatedClients));
      return clientId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setSelectedClient: (state, action) => {
      state.selectedClient = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearClients: (state) => {
      state.items = [];
      state.selectedClient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Clients
      .addCase(loadClients.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadClients.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(loadClients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Client
      .addCase(addClient.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addClient.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.isLoading = false;
      })
      .addCase(addClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Client
      .addCase(updateClient.fulfilled, (state, action) => {
        const { clientId, clientData } = action.payload;
        const index = state.items.findIndex((c) => c.id === clientId);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...clientData };
        }
      })
      // Delete Client
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const { setSelectedClient, setSearchQuery, clearClients } = clientsSlice.actions;
export default clientsSlice.reducer;

