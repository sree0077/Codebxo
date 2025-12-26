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
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration - Replace with your own config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
const db = getFirestore(app);

// Auth Functions
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
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

// Firestore Collections
export const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients',
  INTERACTIONS: 'interactions',
};

// Client CRUD Operations
export const addClient = async (clientData) => {
  try {
    const clientRef = doc(collection(db, COLLECTIONS.CLIENTS));
    await setDoc(clientRef, {
      ...clientData,
      id: clientRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: clientRef.id };
  } catch (error) {
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
    const q = query(
      collection(db, COLLECTIONS.CLIENTS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, clients };
  } catch (error) {
    return { success: false, error: error.message, clients: [] };
  }
};

export { auth, db };

