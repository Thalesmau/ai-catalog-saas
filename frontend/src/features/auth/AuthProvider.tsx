import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { onUnauthorized } from '@/lib/http';
import { tokenStorage } from '@/lib/tokenStorage';

import { authApi, type Session, type SignInInput, type SignUpInput } from './api';
import { AuthContext, type AuthStatus } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? 'loading' : 'unauthenticated'));

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    queryClient.clear();
    setSession(null);
    setStatus('unauthenticated');
  }, [queryClient]);

  const startSession = useCallback(async (accessToken: string) => {
    tokenStorage.set(accessToken);
    setSession(await authApi.me());
    setStatus('authenticated');
  }, []);

  useEffect(() => {
    onUnauthorized(() => {
      clearSession();
      toast.error('Sua sessão expirou. Entre novamente.');
    });
  }, [clearSession]);

  useEffect(() => {
    if (!tokenStorage.get()) {
      return;
    }

    authApi.me()
      .then((me) => {
        setSession(me);
        setStatus('authenticated');
      })
      .catch(clearSession);
  }, [clearSession]);

  const value = useMemo(() => ({
    status,
    session,
    signIn: async (input: SignInInput) => {
      const { accessToken } = await authApi.signIn(input);
      await startSession(accessToken);
    },
    signUp: async (input: SignUpInput) => {
      const { accessToken } = await authApi.signUp(input);
      await startSession(accessToken);
    },
    signOut: clearSession,
  }), [status, session, startSession, clearSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
