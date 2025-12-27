import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addClient as firebaseAddClient,
  updateClient as firebaseUpdateClient,
  deleteClient as firebaseDeleteClient,
  getClientsByUser
} from '../../services/firebase';

const initialState = {
  items: [],
  selectedClient: null,
  isLoading: false,
  error: null,
  searchQuery: '',
};

// Load clients for user from Firestore
export const loadClients = createAsyncThunk(
  'clients/loadClients',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await getClientsByUser(userId);
      if (result.success) {
        // Convert Firestore timestamps to ISO strings
        return result.clients.map(client => ({
          ...client,
          createdAt: client.createdAt?.toDate?.()?.toISOString() || client.createdAt,
          updatedAt: client.updatedAt?.toDate?.()?.toISOString() || client.updatedAt,
        }));
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add new client to Firestore
export const addClient = createAsyncThunk(
  'clients/addClient',
  async ({ userId, clientData }, { rejectWithValue }) => {
    try {
      const result = await firebaseAddClient({
        ...clientData,
        userId,
      });
      if (result.success) {
        return {
          ...clientData,
          id: result.id,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      throw new Error(result.error || 'Failed to add client');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update client in Firestore
export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ userId, clientId, clientData }, { rejectWithValue }) => {
    try {
      const result = await firebaseUpdateClient(clientId, clientData);
      if (result.success) {
        return { clientId, clientData: { ...clientData, updatedAt: new Date().toISOString() } };
      }
      throw new Error(result.error || 'Failed to update client');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete client from Firestore
export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async ({ userId, clientId }, { rejectWithValue }) => {
    try {
      const result = await firebaseDeleteClient(clientId);
      if (result.success) {
        return clientId;
      }
      throw new Error(result.error || 'Failed to delete client');
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

