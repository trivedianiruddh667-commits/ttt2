/**
 * Production Firebase Modular SDK (v10+) Initialization
 * 
 * Provides centralized client initialization with strict TypeScript types,
 * automated environment switching for the Firebase Local Emulator Suite,
 * and pre-configured OAuth provider instances.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore
} from 'firebase/firestore';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

// Environment variables or fallback to your project config
const firebaseConfig: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your-app-id'
};

// Singleton application instance preventing re-initialization during hot module replacement
export const app: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

// Centralized Authentication instance
export const auth: Auth = getAuth(app);

// Centralized Firestore instance
export const db: Firestore = getFirestore(app);

// Pre-configured Google OAuth Provider
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account' // Forces Google account picker for consistent multi-account handling
});

// Optional: Add specific OAuth scopes if required
// googleAuthProvider.addScope('https://www.googleapis.com/auth/userinfo.email');

/**
 * Local Prototyping: Automatically connect to Firebase Local Emulator Suite
 * when running in development mode (e.g. VITE_USE_FIREBASE_EMULATOR=true).
 */
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  const authEmulatorHost = import.meta.env.VITE_AUTH_EMULATOR_HOST || 'http://localhost:9099';
  const firestoreHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 'localhost';
  const firestorePort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT) || 8080;

  try {
    connectAuthEmulator(auth, authEmulatorHost, { disableWarnings: false });
    connectFirestoreEmulator(db, firestoreHost, firestorePort);
    console.info(`[Firebase] Connected to Local Emulator Suite: Auth (${authEmulatorHost}), Firestore (${firestoreHost}:${firestorePort})`);
  } catch (err) {
    console.warn('[Firebase] Emulator connection warning:', err);
  }
}
