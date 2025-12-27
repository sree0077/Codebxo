import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadUser,
  loginUser,
  registerUser,
  logoutUser,
  clearError,
} from '../features/auth/authSlice';
import { clearClients } from '../features/clients/clientsSlice';
import { clearInteractions } from '../features/interactions/interactionsSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  // Removed loadUser() call from here - it's now handled at app level in Navigation component

  // Login handler
  const login = useCallback(
    async (email, password) => {
      const result = await dispatch(loginUser({ email, password }));
      return !result.error;
    },
    [dispatch]
  );

  // Register handler
  const register = useCallback(
    async (email, password) => {
      const result = await dispatch(registerUser({ email, password }));
      return !result.error;
    },
    [dispatch]
  );

  // Logout handler
  const logout = useCallback(async () => {
    dispatch(clearClients());
    dispatch(clearInteractions());
    await dispatch(logoutUser());
  }, [dispatch]);

  // Clear error handler
  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    dismissError,
  };
};

export default useAuth;

