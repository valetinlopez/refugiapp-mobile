import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useReducer,
} from 'react';

import { apiClient } from '@/core/api';
import { tokenStorage } from '@/core/storage';

import { authApi } from '../api/authApi';
import type { LoginRequest, User } from '../types';
import { initialSessionState, sessionReducer, type SessionState } from './sessionReducer';

type SessionContextValue = SessionState & {
  signIn(credentials: LoginRequest): Promise<User>;
  signOut(): Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);

  const clearLocalSession = useCallback(async () => {
    await tokenStorage.clearTokens();
    queryClient.clear();
    dispatch({ type: 'unauthenticated' });
  }, [queryClient]);

  useEffect(() => {
    return apiClient.setSessionInvalidatedHandler(() => {
      queryClient.clear();
      dispatch({ type: 'unauthenticated' });
    });
  }, [queryClient]);

  useEffect(() => {
    let active = true;

    async function restoreSession(): Promise<void> {
      const tokens = await tokenStorage.getTokens();
      if (tokens === null) {
        if (active) {
          dispatch({ type: 'unauthenticated' });
        }
        return;
      }

      try {
        const user = await authApi.getCurrentUser();
        if (active) {
          dispatch({ type: 'authenticated', user });
        }
      } catch {
        await tokenStorage.clearTokens();
        queryClient.clear();
        if (active) {
          dispatch({ type: 'unauthenticated' });
        }
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, [queryClient]);

  const signIn = useCallback(async (credentials: LoginRequest): Promise<User> => {
    const tokenPair = await authApi.login(credentials);
    await tokenStorage.setTokens(tokenPair.accessToken, tokenPair.refreshToken);

    try {
      const user = await authApi.getCurrentUser();
      dispatch({ type: 'authenticated', user });
      return user;
    } catch (error) {
      await tokenStorage.clearTokens();
      throw error;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    const refreshToken = await tokenStorage.getRefreshToken();
    try {
      if (refreshToken !== null) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Logout is best-effort; local credentials are always removed below.
    } finally {
      await clearLocalSession();
    }
  }, [clearLocalSession]);

  return (
    <SessionContext
      value={{
        ...state,
        signIn,
        signOut,
      }}
    >
      {children}
    </SessionContext>
  );
}

export function useSession(): SessionContextValue {
  const context = use(SessionContext);
  if (context === null) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return context;
}
