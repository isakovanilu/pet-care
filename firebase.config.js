// For Expo projects, use Firebase JS SDK
// Install: npm install firebase
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Storage removed - using local file storage (base64) instead
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                             firebaseConfig.projectId !== "YOUR_PROJECT_ID";

// Initialize Firebase
let app;
if (getApps().length === 0) {
  if (!isFirebaseConfigured) {
    console.warn('⚠️ Firebase is not configured! Please update firebase.config.js with your Firebase credentials.');
    console.warn('The app will run but Firebase features will not work.');
  }
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error('Firebase configuration is invalid. Please check firebase.config.js');
  }
} else {
  app = getApps()[0];
}

// Initialize Auth with persistence (web vs mobile)
let auth;
try {
  // Check if we're on web or mobile
  if (typeof window !== 'undefined') {
    // Web: use browser persistence
    auth = getAuth(app);
  } else {
    // Mobile: use AsyncStorage persistence (only if getReactNativePersistence is available)
    try {
      const { getReactNativePersistence } = require('firebase/auth');
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } catch (e) {
      // Fallback if getReactNativePersistence not available
      auth = getAuth(app);
    }
  }
} catch (error) {
  // If already initialized, get the existing instance
  auth = getAuth(app);
}

const firestore = getFirestore(app);
// Storage removed - using local file storage (base64) instead

export { auth, firestore };
export default app;

