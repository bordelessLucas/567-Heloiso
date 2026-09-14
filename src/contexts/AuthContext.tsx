import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { UserProfile } from '@/src/domain/user';
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
  getUserProfile,
} from '@/src/services/user.service';

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      void getUserProfile(nextUser.uid)
        .then((nextProfile) => {
          setProfile(nextProfile);
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
      const credential = await signUpWithEmail(email, password);
      await updateAuthDisplayName(name);
      await createUserProfile({
        id: credential.user.uid,
        email,
        displayName: name,
      });
    },
    [],
  );

  const signOut = useCallback(async () => {
    await signOutCurrentUser();
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordReset(email);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isLoading,
      isAuthenticated: user !== null,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [user, profile, isLoading, signIn, signUp, signOut, resetPassword],
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
