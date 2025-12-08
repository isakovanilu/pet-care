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

// Auth helpers
export const signIn = (email, password) => 
  signInWithEmailAndPassword(auth, email, password);

export const signUp = (email, password) => 
  createUserWithEmailAndPassword(auth, email, password);

export const resetPassword = (email) => 
  sendPasswordResetEmail(auth, email);

export const logout = () => signOut(auth);

export const getCurrentUser = () => auth.currentUser;

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

