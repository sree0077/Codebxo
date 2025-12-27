import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginUser as firebaseLogin,
  registerUser as firebaseRegister,
  logoutUser as firebaseLogout,
  getCurrentUser
} from '../../services/firebase';

// Initial state - start with isLoading: false to show login immediately
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunk for loading user from Firebase auth state
export const loadUser = createAsyncThunk('auth/loadUser', async () => {
  try {
    // Add a small delay to ensure Firebase is initialized
    await new Promise(resolve => setTimeout(resolve, 100));

    const currentUser = getCurrentUser();
    if (currentUser) {
      console.log('User loaded:', currentUser.email);
      return {
        id: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email?.split('@')[0],
      };
    }
    console.log('No user found');
    return null;
  } catch (error) {
    console.error('Error loading user:', error);
    return null;
  }
});

// Async thunk for login with Firebase
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await firebaseLogin(email, password);
      if (result.success) {
        return {
          id: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || result.user.email?.split('@')[0],
        };
      }
      throw new Error(result.error || 'Login failed');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for registration with Firebase
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await firebaseRegister(email, password);
      if (result.success) {
        return {
          id: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || result.user.email?.split('@')[0],
        };
      }
      throw new Error(result.error || 'Registration failed');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for logout with Firebase
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await firebaseLogout();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.isLoading = false;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;

