import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addClient as firebaseAddClient,
  updateClient as firebaseUpdateClient,
  deleteClient as firebaseDeleteClient,
  getClientsByUser
} from '../../services/firebase';
import {
  saveClients,
  loadClients as loadClientsFromStorage,
} from '../../services/storage';
import { executeOrQueue, isOnline } from '../../services/syncService';

const initialState = {
  items: [],
  selectedClient: null,
  isLoading: false,
  error: null,
  searchQuery: '',
};

// Load clients for user from Firestore or local storage
export const loadClients = createAsyncThunk(
  'clients/loadClients',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('[CLIENTS] 📥 Loading clients for user:', userId);

      // Try to load from Firebase if online
      if (isOnline()) {
        const result = await getClientsByUser(userId);
        if (result.success) {
          // Convert Firestore timestamps to ISO strings
          const clients = result.clients.map(client => ({
            ...client,
            createdAt: client.createdAt?.toDate?.()?.toISOString() || client.createdAt,
            updatedAt: client.updatedAt?.toDate?.()?.toISOString() || client.updatedAt,
          }));
          // Save to local storage for offline access
          await saveClients(clients);
          console.log('[CLIENTS] ✅ Loaded', clients.length, 'clients from Firebase');
          return clients;
        }
      }

      // If offline or Firebase failed, load from local storage
      console.log('[CLIENTS] 📴 Loading from local storage (offline mode)');
      const storageResult = await loadClientsFromStorage();
      return storageResult.data || [];
    } catch (error) {
      console.error('[CLIENTS] ❌ Error loading clients:', error.message);
      // Fallback to local storage
      const storageResult = await loadClientsFromStorage();
      return storageResult.data || [];
    }
  }
);

// Add new client to Firestore (with offline support)
export const addClient = createAsyncThunk(
  'clients/addClient',
  async ({ userId, clientData }, { rejectWithValue, getState }) => {
    try {
      console.log('[CLIENTS] ➕ Adding new client:', clientData.clientName);
      const tempId = `temp_${Date.now()}`;
      const newClient = {
        ...clientData,
        id: tempId,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _offline: !isOnline(), // Mark as offline if created offline
      };

      if (isOnline()) {
        const result = await firebaseAddClient({
          ...clientData,
          userId,
        });
        if (result.success) {
          newClient.id = result.id;
          newClient._offline = false;
          console.log('[CLIENTS] ✅ Client added successfully:', result.id);
        }
      } else {
        // Queue for sync when online
        await executeOrQueue('ADD_CLIENT', { ...clientData, userId }, () => {});
        console.log('[CLIENTS] 📴 Client queued for sync');
      }

      // Save updated clients to local storage
      const state = getState();
      // Filter out temp IDs before saving (except the one we just created)
      const existingClients = state.clients.items.filter(c =>
        !c.id.startsWith('temp_') || c.id === newClient.id
      );
      const updatedClients = [newClient, ...existingClients];
      await saveClients(updatedClients);

      return newClient;
    } catch (error) {
      console.error('[CLIENTS] ❌ Error adding client:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Update client in Firestore (with offline support)
export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ userId, clientId, clientData }, { rejectWithValue, getState }) => {
    try {
      const updatedData = { ...clientData, updatedAt: new Date().toISOString() };

      if (isOnline()) {
        const result = await firebaseUpdateClient(clientId, clientData);
        if (!result.success) {
          throw new Error(result.error || 'Failed to update client');
        }
      } else {
        // Queue for sync when online
        await executeOrQueue('UPDATE_CLIENT', { id: clientId, ...clientData }, () => {});
        console.log('[CLIENTS] 📴 Client update queued for sync');
      }

      // Save updated clients to local storage
      const state = getState();
      const updatedClients = state.clients.items.map(c =>
        c.id === clientId ? { ...c, ...updatedData } : c
      );
      await saveClients(updatedClients);

      return { clientId, clientData: updatedData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete client from Firestore (with offline support)
export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async ({ userId, clientId }, { rejectWithValue, getState }) => {
    try {
      if (isOnline()) {
        const result = await firebaseDeleteClient(clientId);
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete client');
        }
      } else {
        // Queue for sync when online
        await executeOrQueue('DELETE_CLIENT', { id: clientId }, () => {});
        console.log('[CLIENTS] 📴 Client deletion queued for sync');
      }

      // Save updated clients to local storage
      const state = getState();
      const updatedClients = state.clients.items.filter(c => c.id !== clientId);
      await saveClients(updatedClients);

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
        console.log('[CLIENTS] 📥 loadClients.fulfilled - Received', action.payload.length, 'clients');
        console.log('[CLIENTS] 📥 Current state has', state.items.length, 'clients');

        // Simply replace with fresh data from Firebase/storage
        // Filter out any temp IDs that might be in the payload
        const freshData = action.payload.filter(item => !item.id?.startsWith('temp_'));
        console.log('[CLIENTS] 🔍 After filtering temp IDs:', freshData.length, 'clients');

        // Remove duplicates by ID (keep first occurrence)
        const uniqueClients = [];
        const seenIds = new Set();

        for (const client of freshData) {
          if (!seenIds.has(client.id)) {
            seenIds.add(client.id);
            uniqueClients.push(client);
          } else {
            console.warn('[CLIENTS] ⚠️ Duplicate ID found:', client.id, client.clientName);
          }
        }

        state.items = uniqueClients;
        state.isLoading = false;

        console.log('[CLIENTS] ✅ Final state:', uniqueClients.length, 'unique clients');
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
        console.log('[CLIENTS] ➕ addClient.fulfilled - Adding client:', action.payload.id, action.payload.clientName);

        // Check if client already exists (prevent duplicates)
        const exists = state.items.some(item => item.id === action.payload.id);
        if (!exists) {
          state.items.unshift(action.payload);
          console.log('[CLIENTS] ✅ Client added to state. Total:', state.items.length);
        } else {
          console.warn('[CLIENTS] ⚠️ Client already exists, skipping:', action.payload.id);
        }
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

