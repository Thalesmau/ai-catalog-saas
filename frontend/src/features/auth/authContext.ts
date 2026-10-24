import { createContext, useContext } from 'react';

import type { Session, SignInInput, SignUpInput } from './api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }

  return context;
}

export function useSession(): Session {
  const { session } = useAuth();

  if (!session) {
    throw new Error('useSession must be used inside a protected route.');
  }

  return session;
}
