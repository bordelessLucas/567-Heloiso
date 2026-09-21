import { collection, getDocs, orderBy, query } from 'firebase/firestore';

import type { InvestorProfileType, UserProfile, UserRole } from '@/src/domain/user';
import { db } from '@/src/services/firebase';

function toIsoString(value: unknown): string {
  if (typeof value === 'string') return value;
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

function mapUser(id: string, data: Record<string, unknown>): UserProfile {
  const role = data.role;
  const validRole: UserRole =
    role === 'admin' || role === 'admin_readonly' || role === 'investor'
      ? role
      : 'investor';
  const investorProfile =
    data.investorProfile === 'conservative' ||
    data.investorProfile === 'moderate' ||
    data.investorProfile === 'aggressive'
      ? (data.investorProfile as InvestorProfileType)
      : null;

  return {
    id,
    email: typeof data.email === 'string' ? data.email : '',
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    role: validRole,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    investorProfile,
  };
}

export async function listUsersForAdmin(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map((item) => mapUser(item.id, item.data() as Record<string, unknown>));
}
