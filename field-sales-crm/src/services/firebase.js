import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mapAuthError } from '../utils/authErrors';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

  if (missingKeys.length > 0) {
    console.error('[FIREBASE] ❌ Missing required environment variables:');
    missingKeys.forEach(key => {
      console.error(`  - EXPO_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
    });
    console.error('[FIREBASE] Please check your .env file and ensure all Firebase variables are set.');
    throw new Error('Firebase configuration incomplete. Check .env file.');
  }
};

// Validate configuration before initializing
validateFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with proper persistence for React Native
let auth;
try {
  if (Platform.OS === 'web') {
    // For web, use default getAuth
    auth = getAuth(app);
  } else {
    // For mobile (iOS/Android), use initializeAuth with AsyncStorage persistence
    // Try to get existing auth instance first
    try {
      auth = getAuth(app);
    } catch (e) {
      // If no auth instance exists, initialize with AsyncStorage
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
  }
} catch (error) {
  // If auth is already initialized, just get the existing instance
  console.log('[FIREBASE] ℹ️ Auth already initialized, using existing instance');
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Auth Functions
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user role from Firestore
    const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userDoc = await getDoc(userDocRef);

    let userData = {
      uid: user.uid,
      email: user.email,
      role: 'user', // Default role
    };

    if (userDoc.exists()) {
      userData = { ...userData, ...userDoc.data() };
      // Fallback for existing users: if they have a role but no status, they are approved
      if (!userData.status) {
        userData.status = 'approved';
      }
    } else {
      // If user document doesn't exist (first login of legacy user), create it as pending
      const newDocData = {
        email: user.email,
        role: 'user',
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      await setDoc(userDocRef, newDocData);
      userData = { ...userData, ...newDocData };
    }

    // Super Admin is always approved if they exist or are created
    if (userData.email === SUPER_ADMIN_EMAIL) {
      userData.role = 'admin';
      userData.status = 'approved';
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          role: 'admin',
          status: 'approved',
          createdAt: serverTimestamp(),
        });
      }
    }

    if (userData.status === 'rejected' || userData.status === 'deleted') {
      return { success: false, error: 'Your account access has been restricted by the administrator.' };
    }

    return { success: true, user: { ...userData, uid: user.uid } };
  } catch (error) {
    console.error('[FIREBASE] ❌ Login error:', error.code, error.message);
    return { success: false, error: mapAuthError(error.code) };
  }
};

export const registerUser = async (email, password, role = 'user', status = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // SECURITY: All new registrations (even Admins) MUST start as pending
    // UNLESS it's the specific Super Admin email
    const finalStatus = email === SUPER_ADMIN_EMAIL ? 'approved' : 'pending';
    const finalRole = email === SUPER_ADMIN_EMAIL ? 'admin' : role;

    // Create user document in Firestore
    const userData = {
      email: user.email,
      role: finalRole,
      status: finalStatus,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);

    console.log('[FIREBASE] ✅ Registration successful');
    return { success: true, user: { uid: user.uid, ...userData } };
  } catch (error) {
    console.error('[FIREBASE] ❌ Registration error:', error.code, error.message);
    return { success: false, error: mapAuthError(error.code) };
  }
};

// Admin Functions
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (userDoc.exists()) {
      return { success: true, userData: userDoc.data() };
    }
    return { success: false, error: 'User document not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteUserAccount = async (userId) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);

    // 1. Mark user as deleted
    await updateDoc(userRef, {
      status: 'deleted',
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 2. Cascade delete associated clients
    console.log('[FIREBASE] 🧹 Cascade deleting clients for user:', userId);
    const clientsQuery = query(collection(db, COLLECTIONS.CLIENTS), where('userId', '==', userId));
    const clientsSnapshot = await getDocs(clientsQuery);
    const clientDeletions = clientsSnapshot.docs.map(clientDoc => deleteDoc(clientDoc.ref));
    await Promise.all(clientDeletions);
    console.log(`[FIREBASE] ✅ Deleted ${clientsSnapshot.size} clients`);

    // 3. Cascade delete associated interactions
    console.log('[FIREBASE] 🧹 Cascade deleting interactions for user:', userId);
    const interactionsQuery = query(collection(db, COLLECTIONS.INTERACTIONS), where('userId', '==', userId));
    const interactionsSnapshot = await getDocs(interactionsQuery);
    const interactionDeletions = interactionsSnapshot.docs.map(intDoc => deleteDoc(intDoc.ref));
    await Promise.all(interactionDeletions);
    console.log(`[FIREBASE] ✅ Deleted ${interactionsSnapshot.size} interactions`);

    return { success: true };
  } catch (error) {
    console.error('[FIREBASE] ❌ Error in cascade deletion:', error.message);
    return { success: false, error: 'Database cleanup partially failed: ' + error.message };
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, { status, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error('[FIREBASE] ❌ Error updating status:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateUserDetails = async (userId, details) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...details,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('[FIREBASE] ❌ Error updating user details:', error.message);
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => auth.currentUser;

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Super Admin Configuration
export const SUPER_ADMIN_EMAIL = 'admin.codebxo@gmail.com';

// Firestore Collections
export const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients',
  INTERACTIONS: 'interactions',
};

// Client CRUD Operations
export const addClient = async (clientData) => {
  try {
    console.log('[FIREBASE] ➕ Adding client to Firestore:', clientData.clientName);
    const clientRef = doc(collection(db, COLLECTIONS.CLIENTS));
    await setDoc(clientRef, {
      ...clientData,
      id: clientRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('[FIREBASE] ✅ Client added with ID:', clientRef.id);
    return { success: true, id: clientRef.id };
  } catch (error) {
    console.error('[FIREBASE] ❌ Error adding client:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateClient = async (clientId, clientData) => {
  try {
    const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId);
    await updateDoc(clientRef, {
      ...clientData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteClient = async (clientId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CLIENTS, clientId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getClientsByUser = async (userId) => {
  try {
    console.log('[FIREBASE] 📥 Fetching clients for user:', userId);
    const q = query(
      collection(db, COLLECTIONS.CLIENTS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('[FIREBASE] ✅ Fetched', clients.length, 'clients');
    return { success: true, clients };
  } catch (error) {
    console.warn('[FIREBASE] ⚠️ Query with orderBy failed:', error.code);
    // If orderBy fails (missing index), try without orderBy
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      console.log('[FIREBASE] 🔄 Retrying without orderBy...');
      try {
        const q = query(
          collection(db, COLLECTIONS.CLIENTS),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort manually by createdAt
        clients.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        });
        console.log('[FIREBASE] ✅ Fetched', clients.length, 'clients (manual sort)');
        return { success: true, clients };
      } catch (retryError) {
        console.error('[FIREBASE] ❌ Retry failed:', retryError.message);
        return { success: false, error: retryError.message, clients: [] };
      }
    }
    console.error('[FIREBASE] ❌ Error fetching clients:', error.message);
    return { success: false, error: error.message, clients: [] };
  }
};

export const getAllClients = async () => {
  try {
    console.log('[FIREBASE] 📥 Fetching ALL clients (Admin View)');
    const q = query(
      collection(db, COLLECTIONS.CLIENTS),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('[FIREBASE] ✅ Fetched', clients.length, 'total clients');
    return { success: true, clients };
  } catch (error) {
    console.error('[FIREBASE] ❌ Error fetching all clients:', error.message);
    return { success: false, error: error.message, clients: [] };
  }
};

export const getClientCount = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.CLIENTS));
    return { success: true, count: snapshot.size };
  } catch (error) {
    return { success: false, error: error.message, count: 0 };
  }
};

// Interaction CRUD Operations
export const addInteraction = async (interactionData) => {
  try {
    const interactionRef = doc(collection(db, COLLECTIONS.INTERACTIONS));
    await setDoc(interactionRef, {
      ...interactionData,
      id: interactionRef.id,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: interactionRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateInteraction = async (interactionId, interactionData) => {
  try {
    const interactionRef = doc(db, COLLECTIONS.INTERACTIONS, interactionId);
    await updateDoc(interactionRef, interactionData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteInteraction = async (interactionId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.INTERACTIONS, interactionId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getInteractionsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.INTERACTIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const interactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, interactions };
  } catch (error) {
    // If orderBy fails (missing index), try without orderBy
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      try {
        const q = query(
          collection(db, COLLECTIONS.INTERACTIONS),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const interactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort manually by createdAt
        interactions.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        });
        return { success: true, interactions };
      } catch (retryError) {
        return { success: false, error: retryError.message, interactions: [] };
      }
    }
    return { success: false, error: error.message, interactions: [] };
  }
};

export { auth, db };

