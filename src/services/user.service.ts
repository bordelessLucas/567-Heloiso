import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import {
  CreateUserProfileInput,
  InvestorProfileType,
  InvestorSensitiveProfile,
  UpdateInvestorSensitiveProfileInput,
  UserProfile,
  UserRole,
} from '@/src/domain/user';
import { db } from '@/src/services/firebase';

const USERS_COLLECTION = 'users';
const INVESTOR_PROFILE_DOC = 'investor-profile';

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

function toNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function mapInvestorSensitiveProfile(data: Record<string, unknown>): InvestorSensitiveProfile {
  const investmentGoal =
    data.investmentGoal === 'income' ||
    data.investmentGoal === 'growth' ||
    data.investmentGoal === 'preservation' ||
    data.investmentGoal === 'learning' ||
    data.investmentGoal === 'retirement' ||
    data.investmentGoal === 'wealth' ||
    data.investmentGoal === 'property' ||
    data.investmentGoal === 'other'
      ? data.investmentGoal
      : null;
  const investmentHorizon =
    data.investmentHorizon === 'short' ||
    data.investmentHorizon === 'medium' ||
    data.investmentHorizon === 'long' ||
    data.investmentHorizon === 'y2' ||
    data.investmentHorizon === 'y5' ||
    data.investmentHorizon === 'y10' ||
    data.investmentHorizon === 'y15' ||
    data.investmentHorizon === 'y20' ||
    data.investmentHorizon === 'y25' ||
    data.investmentHorizon === 'more'
      ? data.investmentHorizon
      : null;

  return {
    monthlyIncome: toNullableNumber(data.monthlyIncome),
    declaredNetWorth: toNullableNumber(data.declaredNetWorth),
    investmentGoal,
    investmentHorizon,
    lgpdConsent: data.lgpdConsent === true,
    lgpdConsentAt: data.lgpdConsentAt ? toIsoString(data.lgpdConsentAt) : null,
    updatedAt: toIsoString(data.updatedAt),
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
  data: Partial<Pick<UserProfile, 'displayName' | 'investorProfile'>>,
): Promise<void> {
  const payload: {
    displayName?: string;
    investorProfile?: InvestorProfileType | null;
  } = {};

  if (typeof data.displayName === 'string') {
    payload.displayName = data.displayName.trim();
  }

  if (data.investorProfile !== undefined) {
    payload.investorProfile = data.investorProfile;
  }

  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function getInvestorSensitiveProfile(
  userId: string,
): Promise<InvestorSensitiveProfile | null> {
  const snapshot = await getDoc(
    doc(db, USERS_COLLECTION, userId, 'sensitive', INVESTOR_PROFILE_DOC),
  );

  if (!snapshot.exists()) {
    return null;
  }

  return mapInvestorSensitiveProfile(snapshot.data() as Record<string, unknown>);
}

export async function updateInvestorSensitiveProfile(
  userId: string,
  input: UpdateInvestorSensitiveProfileInput,
): Promise<void> {
  await setDoc(
    doc(db, USERS_COLLECTION, userId, 'sensitive', INVESTOR_PROFILE_DOC),
    {
      monthlyIncome: input.monthlyIncome ?? null,
      declaredNetWorth: input.declaredNetWorth ?? null,
      investmentGoal: input.investmentGoal ?? null,
      investmentHorizon: input.investmentHorizon ?? null,
      lgpdConsent: input.lgpdConsent,
      lgpdConsentAt: input.lgpdConsent ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
