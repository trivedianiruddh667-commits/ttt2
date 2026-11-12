import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  'trivedianiruddh667@gmail.com',
  'nrddhtrivedi@gmail.com'
];

export const BOOTSTRAPPED_ADMIN_EMAIL = 'trivedianiruddh667@gmail.com';

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === normalized);
}

export async function uploadMediaToCloud(
  file: File,
  folder: 'courses' | 'news' | 'teachers' | 'cms' = 'courses'
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${folder}/${Date.now()}_${safeName}`;
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (err) {
    console.warn('Direct Firebase Storage upload encountered error, using inline secure media encoding:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}

// Boot-time Firestore connectivity validation
export async function testFirestoreConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase Firestore client is offline. Please check your Firebase configuration.');
    }
  }
}
testFirestoreConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function emailToSafeDocId(email: string): string {
  const safe = email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  return safe.slice(0, 120) || 'unknown_user';
}

export interface FormattedAuthError {
  message: string;
  isProviderDisabled?: boolean;
}

export function formatFirebaseAuthError(error: unknown): FormattedAuthError {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  const rawMessage = error instanceof Error ? error.message : String(error);

  switch (code) {
    case 'auth/operation-not-allowed':
      return {
        message:
          'Email/Password sign-in is not enabled in Firebase Console yet. Enable it under Authentication -> Sign-in method -> Email/Password, or use Google Sign-In below.',
        isProviderDisabled: true
      };
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return { message: 'Invalid email or password. Please check your credentials and try again.' };
    case 'auth/email-already-in-use':
      return {
        message: 'An account with this email already exists. Switch to Log In or reset your password.'
      };
    case 'auth/weak-password':
      return { message: 'Password must be at least 6 characters long.' };
    case 'auth/invalid-email':
      return { message: 'Please enter a valid email address.' };
    case 'auth/too-many-requests':
      return { message: 'Too many attempts. Please wait a moment before trying again.' };
    case 'auth/popup-closed-by-user':
      return { message: 'Google sign-in popup was closed before completing.' };
    case 'auth/popup-blocked':
      return { message: 'Sign-in popup was blocked by your browser. Please allow popups and try again.' };
    case 'auth/unauthorized-domain':
      return {
        message: `This domain is not authorized for Google Sign-In yet. Add this hostname under Firebase Console (${FIREBASE_PROJECT_ID}) -> Authentication -> Settings -> Authorized domains.`
      };
    case 'auth/network-request-failed':
      return { message: 'Network error communicating with Firebase. Check your connection and retry.' };
    default:
      return { message: rawMessage || 'Authentication failed. Please try again.' };
  }
}
