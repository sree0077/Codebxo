import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import clientsReducer from '../features/clients/clientsSlice';
import interactionsReducer from '../features/interactions/interactionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    interactions: interactionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (Firebase timestamps are not serializable)
        ignoredActions: ['auth/setUser', 'clients/setClients', 'interactions/setInteractions'],
        // Ignore these field paths in state
        ignoredPaths: ['auth.user', 'clients.items', 'interactions.items'],
      },
    }),
});

export default store;

