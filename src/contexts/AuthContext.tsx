import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {
  InvestorSensitiveProfile,
  UpdateInvestorSensitiveProfileInput,
  UserProfile,
} from '@/src/domain/user';
import {
  AuthUser,
  getCurrentUser,
  sendPasswordReset,
  signInWithEmail,
  signOutCurrentUser,
  signUpWithEmail,
  subscribeToAuthState,
  updateAuthDisplayName,
} from '@/src/services/auth.service';
import {
  createUserProfile,
  getInvestorSensitiveProfile,
  getUserProfile,
  updateInvestorSensitiveProfile,
  updateUserProfile,
} from '@/src/services/user.service';

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  sensitiveProfile: InvestorSensitiveProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (
    data: Partial<Pick<UserProfile, 'displayName' | 'investorProfile'>>,
  ) => Promise<void>;
  updateSensitiveProfile: (data: UpdateInvestorSensitiveProfileInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sensitiveProfile, setSensitiveProfile] = useState<InvestorSensitiveProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setSensitiveProfile(null);
        setIsLoading(false);
        return;
      }

      void Promise.all([
        getUserProfile(nextUser.uid),
        getInvestorSensitiveProfile(nextUser.uid),
      ])
        .then(([nextProfile, nextSensitiveProfile]) => {
          setProfile(nextProfile);
          setSensitiveProfile(nextSensitiveProfile);
        })
        .catch(() => {
          setProfile(null);
          setSensitiveProfile(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const credential = await signUpWithEmail(normalizedEmail, password);
      await updateAuthDisplayName(name);
      const created = await createUserProfile({
        id: credential.user.uid,
        email: credential.user.email ?? normalizedEmail,
        displayName: name,
      });
      setProfile(created);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await signOutCurrentUser();
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordReset(email.trim().toLowerCase());
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Pick<UserProfile, 'displayName' | 'investorProfile'>>) => {
      if (!user) {
        throw new Error('No authenticated user to update.');
      }

      if (typeof data.displayName === 'string') {
        await updateAuthDisplayName(data.displayName);
      }

      await updateUserProfile(user.uid, data);
      const refreshed = await getUserProfile(user.uid);
      setProfile(refreshed);
      setUser(getCurrentUser());
    },
    [user],
  );

  const updateSensitiveProfile = useCallback(
    async (data: UpdateInvestorSensitiveProfileInput) => {
      if (!user) {
        throw new Error('No authenticated user to update.');
      }

      await updateInvestorSensitiveProfile(user.uid, data);
      const refreshed = await getInvestorSensitiveProfile(user.uid);
      setSensitiveProfile(refreshed);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      sensitiveProfile,
      isLoading,
      isAuthenticated: user !== null,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      updateSensitiveProfile,
    }),
    [
      user,
      profile,
      sensitiveProfile,
      isLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      updateSensitiveProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
