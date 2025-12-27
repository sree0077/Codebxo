import { initializeApp } from 'firebase/app';
import {
  getAuth,
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

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuxdtq-HGz7YxRREiPLphONLv65DrE9co",
  authDomain: "codebxo-66cab.firebaseapp.com",
  projectId: "codebxo-66cab",
  storageBucket: "codebxo-66cab.firebasestorage.app",
  messagingSenderId: "981206511276",
  appId: "1:981206511276:web:aca4c5e60fea466e777909",
  measurementId: "G-QFDS8GH1FH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth - use getAuth for both web and mobile
// Firebase handles persistence automatically
const auth = getAuth(app);

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
    return { success: false, error: error.message, interactions: [] };
  }
};

export { auth, db };

