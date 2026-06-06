import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot, Timestamp, addDoc, deleteDoc, updateDoc, getDocFromServer, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setLogLevel, memoryLocalCache } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Silence internal Firestore connection logs and warnings that do not constitute app errors
try {
  setLogLevel('error');
} catch (e) {
  console.warn("Could not adjust Firestore log level:", e);
}

// Helper to detect if local persistence / IndexedDB is supported and accessible in the current browser/iframe context
function isPersistenceSupported(): boolean {
  try {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return false;
    }
    // Attempting to evaluate window.indexedDB will throw a SecurityError in sandboxed cross-origin iframes
    const test = window.indexedDB;
    return !!test;
  } catch (e) {
    return false;
  }
}

// Initialize Firestore with offline persistence enablement, falling back to standard or memory if blocked
let dbInstance;
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

try {
  const cacheSettings = isPersistenceSupported()
    ? {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      }
    : {
        localCache: memoryLocalCache()
      };

  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    ...cacheSettings
  }, databaseId);
} catch (error) {
  console.warn("Firestore custom initialization failed, falling back to standard Firestore client with DB ID:", error);
  dbInstance = getFirestore(app, databaseId);
}

export const db = dbInstance;
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Firestore Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Specific check for networking/auth failure in this environment
  if (errorMessage.includes('auth/network-request-failed')) {
    console.error('Firebase Auth Network Failure: The application is unable to reach Google Authentication services. This may be due to a strict network environment or blocked requests. Please try refreshing or opening in a new tab.');
  }

  const isOfflineError = errorMessage.toLowerCase().includes('offline') || 
                         errorMessage.toLowerCase().includes('unavailable') || 
                         errorMessage.toLowerCase().includes('could not reach cloud firestore backend') ||
                         errorMessage.toLowerCase().includes('network') ||
                         errorMessage.toLowerCase().includes('connection failed') ||
                         errorMessage.toLowerCase().includes('failed to get document');

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };

  if (isOfflineError) {
    console.warn('Firestore is running in Offline Mode for operation:', operationType, 'at path:', path, '. Details:', errorMessage);
    // Do not throw for offline/network issues to prevent app crashes; allow clients to use cached data
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection strictly against the server to verify config if manually invoked
export async function testConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    // Using getDocFromServer forces a network round-trip instead of using cached data
    await getDocFromServer(testDoc);
    console.log("Firestore Connected successfully to database:", firebaseConfig.firestoreDatabaseId);
    console.log("Firestore Settings:", {
      projectId: firebaseConfig.projectId,
      dbId: firebaseConfig.firestoreDatabaseId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('the client is offline') || message.includes('unavailable')) {
      console.warn("Firestore running in offline mode. Local caching active.");
    } else {
      console.warn("Firestore connectivity test noted unexpected state:", message);
    }
  }
}
// Removed immediate testConnection() call on load to stay completely offline-friendly

