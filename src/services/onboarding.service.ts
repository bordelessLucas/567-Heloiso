import AsyncStorage from '@react-native-async-storage/async-storage';

import type { InvestmentExperience, OnboardingProfile } from '@/src/domain/onboarding';

function storageKey(userId: string) {
  return `@mercado-fiis/onboarding/${userId}`;
}

export async function getOnboardingProfile(
  userId: string,
): Promise<OnboardingProfile | null> {
  const stored = await AsyncStorage.getItem(storageKey(userId));
  if (!stored) return null;

  try {
    const profile = JSON.parse(stored) as Partial<OnboardingProfile>;
    if (
      (profile.experience === 'beginner' || profile.experience === 'experienced') &&
      typeof profile.completedAt === 'string'
    ) {
      return profile as OnboardingProfile;
    }
  } catch {
    // Dados locais inválidos voltam ao onboarding seguro.
  }

  return null;
}

export async function saveOnboardingProfile(
  userId: string,
  experience: InvestmentExperience,
): Promise<OnboardingProfile> {
  const profile = { experience, completedAt: new Date().toISOString() };
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(profile));
  return profile;
}
