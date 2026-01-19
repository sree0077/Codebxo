import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadClients,
  addClient,
  updateClient,
  deleteClient,
  setSelectedClient,
  setSearchQuery,
  loadAllClients,
} from '../features/clients/clientsSlice';

export const useClients = () => {
  const dispatch = useDispatch();
  const { items, selectedClient, isLoading, error, searchQuery } = useSelector(
    (state) => state.clients
  );
  const { user } = useSelector((state) => state.auth);

  // NOTE: Loading is handled by useSync hook in Navigation component
  // We don't load here to avoid duplicate loads and race conditions

  // Filtered clients based on search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }
    const query = searchQuery.toLowerCase();
    return items.filter(
      (client) =>
        client.clientName?.toLowerCase().includes(query) ||
        client.companyName?.toLowerCase().includes(query) ||
        client.phoneNumber?.includes(query)
    );
  }, [items, searchQuery]);

  // Add new client
  const createClient = useCallback(
    async (clientData) => {
      if (!user?.id) return { success: false, error: 'User not authenticated' };
      const result = await dispatch(addClient({
        userId: user.id,
        userEmail: user.email, // Pass email for attribution
        clientData
      }));
      return { success: !result.error, error: result.error?.message };
    },
    [dispatch, user?.id, user?.email]
  );

  // Update existing client
  const editClient = useCallback(
    async (clientId, clientData) => {
      if (!user?.id) return { success: false, error: 'User not authenticated' };
      const result = await dispatch(updateClient({ userId: user.id, clientId, clientData }));
      return { success: !result.error, error: result.error?.message };
    },
    [dispatch, user?.id]
  );

  // Delete client
  const removeClient = useCallback(
    async (clientId) => {
      if (!user?.id) return { success: false, error: 'User not authenticated' };
      const result = await dispatch(deleteClient({ userId: user.id, clientId }));
      return { success: !result.error, error: result.error?.message };
    },
    [dispatch, user?.id]
  );

  // Select a client
  const selectClient = useCallback(
    (client) => {
      dispatch(setSelectedClient(client));
    },
    [dispatch]
  );

  // Update search query
  const updateSearchQuery = useCallback(
    (query) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  // Refresh clients
  const refreshClients = useCallback(() => {
    if (user?.id) {
      dispatch(loadClients(user.id));
    }
  }, [dispatch, user?.id]);

  // Get client by ID
  const getClientById = useCallback(
    (clientId) => {
      return items.find((client) => client.id === clientId);
    },
    [items]
  );

  return {
    clients: items,
    filteredClients,
    selectedClient,
    isLoading,
    error,
    searchQuery,
    createClient,
    editClient,
    removeClient,
    selectClient,
    updateSearchQuery,
    refreshClients,
    loadAllClients: useCallback(() => dispatch(loadAllClients()), [dispatch]),
    getClientById,
  };
};

export default useClients;

