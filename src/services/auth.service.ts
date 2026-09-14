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

import { auth } from '@/src/services/firebase';

export type AuthUser = User;

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email.trim(), password);
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
  await sendPasswordResetEmail(auth, email.trim());
}

export function subscribeToAuthState(
  callback: (user: AuthUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): AuthUser | null {
  return auth.currentUser;
}
