import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginUser as firebaseLogin,
  registerUser as firebaseRegister,
  logoutUser as firebaseLogout,
  onAuthChange,
  getUserData
} from '../../services/firebase';

// Initial state - start with isLoading: false to show login immediately
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunk for loading user from Firebase auth state
// This uses onAuthStateChanged to wait for Firebase to restore the session
export const loadUser = createAsyncThunk('auth/loadUser', async () => {
  try {
    // Use a promise to wait for Firebase auth state to be determined
    const user = await new Promise((resolve) => {
      const unsubscribe = onAuthChange((user) => {
        unsubscribe(); // Unsubscribe immediately after first call
        resolve(user);
      });
    });

    if (user) {
      console.log('User loaded from Firebase:', user.email);
      // Fetch user role from Firestore
      const result = await getUserData(user.uid);
      const roleValue = result.userData?.role || 'user';
      // Approved if record exists with a role (legacy user) or explicitly approved
      const statusValue = result.userData?.status || (result.userData?.role ? 'approved' : 'pending');

      return {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        role: roleValue,
        status: roleValue === 'admin' ? 'approved' : statusValue,
      };
    }
    console.log('No user found in Firebase auth state');
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
      console.log('[AUTH] 🔐 Login attempt for:', email);
      const result = await firebaseLogin(email, password);
      if (result.success) {
        console.log('[AUTH] ✅ Login successful:', result.user.email, 'Role:', result.user.role);
        return {
          id: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || result.user.email?.split('@')[0],
          role: result.user.role,
          status: result.user.status,
        };
      }
      console.error('[AUTH] ❌ Login failed:', result.error);
      throw new Error(result.error || 'Login failed');
    } catch (error) {
      console.error('[AUTH] ❌ Login error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for registration with Firebase
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password, role = 'user', status = null }, { rejectWithValue }) => {
    try {
      console.log('[AUTH] 📝 Registration attempt for:', email, 'Role:', role, 'Status:', status);
      const result = await firebaseRegister(email, password, role, status);
      if (result.success) {
        console.log('[AUTH] ✅ Registration successful:', result.user.email);
        return {
          id: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || result.user.email?.split('@')[0],
          role: result.user.role,
          status: result.user.status,
        };
      }
      console.error('[AUTH] ❌ Registration failed:', result.error);
      throw new Error(result.error || 'Registration failed');
    } catch (error) {
      console.error('[AUTH] ❌ Registration error:', error.message);
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

