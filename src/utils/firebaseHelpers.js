// Firebase helper functions for easier usage
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, firestore } from '../../firebase.config';
import { Platform } from 'react-native';

// Check if Firebase is configured - DISABLED: Using localStorage only
const isFirebaseConfigured = () => {
  return false; // Force localStorage authentication
};

// localStorage-based authentication (fallback when Firebase not configured)
const localStorageAuth = {
  signIn: async (email, password) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      throw new Error('localStorage authentication only works on web');
    }
    
    const users = JSON.parse(window.localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Set current user
    const userId = user.uid || user.id;
    window.localStorage.setItem('currentUser', JSON.stringify({
      uid: userId,
      email: user.email,
      displayName: user.name || ''
    }));
    
    // Trigger auth state change event
    window.dispatchEvent(new Event('authStateChanged'));
    
    return { user: { uid: userId, email: user.email } };
  },
  
  signUp: async (email, password, userData = {}) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      throw new Error('localStorage authentication only works on web');
    }
    
    const users = JSON.parse(window.localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }
    
    const userId = `user_${Date.now()}`;
    const newUser = {
      id: userId,
      uid: userId, // Also store as uid for consistency
      email,
      password, // In production, this should be hashed
      name: userData.name || '',
      phone: userData.phone || '',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    window.localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login after registration
    const currentUserData = {
      uid: userId,
      email: newUser.email,
      displayName: userData.name || ''
    };
    window.localStorage.setItem('currentUser', JSON.stringify(currentUserData));
    
    // Trigger auth state change event
    window.dispatchEvent(new Event('authStateChanged'));
    
    return { user: { uid: userId, email: newUser.email } };
  },
  
  getCurrentUser: () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return null;
    }
    
    const userStr = window.localStorage.getItem('currentUser');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    // Return a mock user object that matches Firebase user structure
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
  },
  
  logout: () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem('currentUser');
      // Trigger auth state change event
      window.dispatchEvent(new Event('authStateChanged'));
    }
  }
};

// Auth helpers with fallback
export const signIn = async (email, password) => {
  // Always use localStorage authentication
  return localStorageAuth.signIn(email, password);
};

export const signUp = async (email, password, userData = {}) => {
  // Always use localStorage authentication
  return localStorageAuth.signUp(email, password, userData);
};

export const resetPassword = async (email) => {
  // Password reset not implemented for localStorage auth
  throw new Error('Password reset not available with localStorage authentication');
};

export const logout = async () => {
  // Always use localStorage authentication
  localStorageAuth.logout();
};

export const getCurrentUser = () => {
  // Always use localStorage authentication
  return localStorageAuth.getCurrentUser();
};

// Firestore helpers
export const getCollection = (collectionName) => 
  collection(firestore, collectionName);

export const getDocument = (collectionName, docId) => 
  doc(firestore, collectionName, docId);

export const createDocument = async (collectionName, data) => {
  const docRef = await addDoc(collection(firestore, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef;
};

export const setDocument = async (collectionName, docId, data) => {
  await setDoc(doc(firestore, collectionName, docId), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const updateDocument = (collectionName, docId, data) => 
  updateDoc(doc(firestore, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const deleteDocument = (collectionName, docId) => 
  deleteDoc(doc(firestore, collectionName, docId));

export const getDocumentData = async (collectionName, docId) => {
  const docSnap = await getDoc(doc(firestore, collectionName, docId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const queryCollection = async (collectionName, constraints = []) => {
  const q = query(collection(firestore, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Storage helpers - using local file storage (base64 data URLs)
export const uploadFile = async (uri) => {
  // Convert image URI to base64 data URL
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Return base64 data URL
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Export Firestore utilities
export { serverTimestamp, Timestamp, where, orderBy };

