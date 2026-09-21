import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { MARKET_DEMO_EMAIL } from '@/src/data/mocks/demo.account';
import { auth } from '@/src/services/firebase';

export type AuthUser = User;

const MARKET_DEMO_PASSWORD = 'borderless.';

function isMarketDemoCredential(email: string, password: string): boolean {
  return email.trim().toLowerCase() === MARKET_DEMO_EMAIL && password === MARKET_DEMO_PASSWORD;
}

function getFirebaseErrorCode(error: unknown): string | null {
  return typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
    ? (error as { code: string }).code
    : null;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    return await signInWithEmailAndPassword(auth, normalizedEmail, password);
  } catch (error) {
    if (
      isMarketDemoCredential(normalizedEmail, password) &&
      ['auth/invalid-credential', 'auth/user-not-found'].includes(
        getFirebaseErrorCode(error) ?? '',
      )
    ) {
      return createUserWithEmailAndPassword(auth, normalizedEmail, password);
    }

    throw error;
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export async function updateAuthDisplayName(displayName: string): Promise<void> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No authenticated user to update.');
  }

  await updateProfile(currentUser, { displayName: displayName.trim() });
}

export async function signOutCurrentUser(): Promise<void> {
  await signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export function subscribeToAuthState(
  callback: (user: AuthUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): AuthUser | null {
  return auth.currentUser;
}
