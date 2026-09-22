import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type FirebaseEnvKey =
  | 'EXPO_PUBLIC_FIREBASE_API_KEY'
  | 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'
  | 'EXPO_PUBLIC_FIREBASE_PROJECT_ID'
  | 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'
  | 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  | 'EXPO_PUBLIC_FIREBASE_APP_ID'
  | 'EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID';

const FIREBASE_ENV_FALLBACKS: Record<FirebaseEnvKey, string> = {
  EXPO_PUBLIC_FIREBASE_API_KEY: 'missing-api-key',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'missing-firebase-config.firebaseapp.com',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'missing-firebase-config',
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: 'missing-firebase-config.appspot.com',
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '0',
  EXPO_PUBLIC_FIREBASE_APP_ID: '1:0:web:missing-firebase-config',
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: '',
};

const missingFirebaseEnvKeys = (
  Object.keys(FIREBASE_ENV_FALLBACKS) as FirebaseEnvKey[]
).filter((key) => !process.env[key]);

export const isFirebaseConfigured = missingFirebaseEnvKeys.length === 0;

function readEnv(key: FirebaseEnvKey): string {
  const value = process.env[key];

  if (!value) {
    return FIREBASE_ENV_FALLBACKS[key];
  }

  return value;
}

const firebaseConfig = {
  apiKey: readEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: readEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
  measurementId: readEnv('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'),
};

function createFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(firebaseConfig);
}

function createAuth(app: FirebaseApp): Auth {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    // Already initialized (Fast Refresh / second import).
    return getAuth(app);
  }
}

export const firebaseApp: FirebaseApp = createFirebaseApp();
export const auth: Auth = createAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);
