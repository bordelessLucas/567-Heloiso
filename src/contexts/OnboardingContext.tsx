import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { InvestmentExperience, OnboardingProfile } from '@/src/domain/onboarding';
import { useAuth } from '@/src/hooks/useAuth';
import {
  getOnboardingProfile,
  saveOnboardingProfile,
} from '@/src/services/onboarding.service';

interface OnboardingContextValue {
  complete: (experience: InvestmentExperience) => Promise<void>;
  isComplete: boolean;
  isLoading: boolean;
  profile: OnboardingProfile | null;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setProfile(null);

    if (authLoading) return () => { active = false; };
    if (!user) {
      setIsLoading(false);
      return () => { active = false; };
    }

    setIsLoading(true);
    void getOnboardingProfile(user.uid)
      .then((stored) => { if (active) setProfile(stored); })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, [authLoading, user]);

  const complete = useCallback(async (experience: InvestmentExperience) => {
    if (!user) return;
    const saved = await saveOnboardingProfile(user.uid, experience);
    setProfile(saved);
  }, [user]);

  const value = useMemo(() => ({
    complete,
    isComplete: profile !== null,
    isLoading,
    profile,
  }), [complete, isLoading, profile]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboardingContext must be used within OnboardingProvider');
  return context;
}
