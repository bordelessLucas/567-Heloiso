import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import {
  CreateUserProfileInput,
  UserProfile,
  UserRole,
} from '@/src/domain/user';
import { db } from '@/src/services/firebase';

const USERS_COLLECTION = 'users';

function toIsoString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (
    value !== null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return new Date().toISOString();
}

function mapUserProfile(id: string, data: Record<string, unknown>): UserProfile {
  const role = data.role;
  const validRole: UserRole =
    role === 'admin' || role === 'admin_readonly' || role === 'investor'
      ? role
      : 'investor';

  return {
    id,
    email: typeof data.email === 'string' ? data.email : '',
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    role: validRole,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    investorProfile:
      data.investorProfile === 'conservative' ||
      data.investorProfile === 'moderate' ||
      data.investorProfile === 'aggressive'
        ? data.investorProfile
        : null,
  };
}

export async function createUserProfile(
  input: CreateUserProfileInput,
): Promise<UserProfile> {
  const ref = doc(db, USERS_COLLECTION, input.id);
  const now = new Date().toISOString();

  const payload = {
    email: input.email.trim(),
    displayName: input.displayName.trim(),
    role: 'investor' as const,
    createdAt: now,
    updatedAt: now,
    investorProfile: null,
  };

  await setDoc(ref, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: input.id,
    ...payload,
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, userId));

  if (!snapshot.exists()) {
    return null;
  }

  return mapUserProfile(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<UserProfile, 'displayName'>>,
): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
