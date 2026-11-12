/**
 * Production Firebase Authentication Service (Web / TypeScript)
 * 
 * Strict TypeScript implementation of:
 * - Email & Password Sign Up (with automated verification dispatch)
 * - Email & Password Sign In
 * - Google Sign-In with popup & credential negotiation
 * - Password Reset
 * - Reactive Auth State Listener with clean unsubscribe pattern
 * - Normalized, human-friendly error mapping
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
  UserCredential,
  Unsubscribe,
  AuthError
} from 'firebase/auth';
import { auth, googleAuthProvider } from './firebase';

export interface AuthStateChangeCallback {
  (user: User | null): void;
}

export interface NormalizedAuthError {
  code: string;
  message: string;
  isFatal: boolean;
}

export interface RegisterEmailOptions {
  email: string;
  password: string;
  displayName?: string;
  sendVerification?: boolean;
}

/**
 * Normalizes Firebase Auth errors into actionable, user-friendly messages.
 */
export function normalizeAuthError(error: unknown): NormalizedAuthError {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const authErr = error as AuthError;
    switch (authErr.code) {
      case 'auth/invalid-email':
        return {
          code: authErr.code,
          message: 'The email address format is invalid. Please check for typos.',
          isFatal: false
        };
      case 'auth/user-disabled':
        return {
          code: authErr.code,
          message: 'This account has been disabled by security administrators.',
          isFatal: true
        };
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return {
          code: authErr.code,
          message: 'Invalid email or password. Please verify your credentials and try again.',
          isFatal: false
        };
      case 'auth/email-already-in-use':
        return {
          code: authErr.code,
          message: 'An account with this email address already exists. Please log in instead.',
          isFatal: false
        };
      case 'auth/weak-password':
        return {
          code: authErr.code,
          message: 'Password is too weak. Please use at least 8 characters with numbers and symbols.',
          isFatal: false
        };
      case 'auth/popup-closed-by-user':
        return {
          code: authErr.code,
          message: 'The Google Sign-In window was closed before completing authentication.',
          isFatal: false
        };
      case 'auth/popup-blocked':
        return {
          code: authErr.code,
          message: 'The authentication popup was blocked by your browser. Please allow popups for this site.',
          isFatal: false
        };
      case 'auth/too-many-requests':
        return {
          code: authErr.code,
          message: 'Too many unsuccessful attempts. Access is temporarily restricted. Please try again shortly.',
          isFatal: false
        };
      case 'auth/network-request-failed':
        return {
          code: authErr.code,
          message: 'Network connectivity error. Please check your internet connection.',
          isFatal: false
        };
      default:
        return {
          code: authErr.code,
          message: authErr.message || 'An unexpected authentication error occurred.',
          isFatal: false
        };
    }
  }

  return {
    code: 'auth/unknown',
    message: error instanceof Error ? error.message : 'An unknown authentication failure occurred.',
    isFatal: false
  };
}

/**
 * Register a new user with Email and Password.
 * Automatically triggers an email verification dispatch if requested.
 */
export async function registerWithEmail(options: RegisterEmailOptions): Promise<User> {
  const { email, password, displayName, sendVerification = true } = options;

  try {
    const cred: UserCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

    // Attach displayName if provided
    if (displayName?.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }

    // Dispatch verification link
    if (sendVerification) {
      await sendEmailVerification(cred.user);
    }

    return cred.user;
  } catch (err: unknown) {
    throw normalizeAuthError(err);
  }
}

/**
 * Sign in existing user with Email and Password.
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const cred: UserCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return cred.user;
  } catch (err: unknown) {
    throw normalizeAuthError(err);
  }
}

/**
 * Sign in or Register using Google OAuth Popup.
 * Handles credential exchange and identity token negotiation.
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const cred: UserCredential = await signInWithPopup(auth, googleAuthProvider);
    return cred.user;
  } catch (err: unknown) {
    throw normalizeAuthError(err);
  }
}

/**
 * Send password reset email with optional return URL.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err: unknown) {
    throw normalizeAuthError(err);
  }
}

/**
 * Signs out the currently authenticated user across the client session.
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err: unknown) {
    throw normalizeAuthError(err);
  }
}

/**
 * Subscribes to real-time authentication state changes.
 * 
 * @param onUserChange Callback fired whenever user signs in, signs out, or token refreshes.
 * @returns Clean Unsubscribe function to prevent memory leaks in component lifecycles.
 */
export function subscribeToAuthState(onUserChange: AuthStateChangeCallback): Unsubscribe {
  return onAuthStateChanged(
    auth,
    (user: User | null) => {
      onUserChange(user);
    },
    (error: Error) => {
      console.error('[Auth Listener Error]:', error);
      onUserChange(null);
    }
  );
}

/**
 * Helper to retrieve fresh ID token with optional force-refresh (e.g. for custom claims).
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken(forceRefresh);
}
