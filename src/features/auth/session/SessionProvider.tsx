import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';

import { apiClient, ApiError } from '@/core/api';
import { isNetworkError } from '@/core/network';
import { tokenStorage } from '@/core/storage';

import { authApi } from '../api/authApi';
import type { LoginRequest, User } from '../types';
import { initialSessionState, sessionReducer, type SessionState } from './sessionReducer';

type SessionCleanupHandler = () => Promise<void>;

type SessionContextValue = SessionState & {
  endSession(notice?: string | null): Promise<void>;
  registerSignOutHandler(handler: SessionCleanupHandler): () => void;
  signIn(credentials: LoginRequest): Promise<User>;
  signOut(): Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  const signOutHandlers = useRef(new Set<SessionCleanupHandler>());

  const registerSignOutHandler = useCallback((handler: SessionCleanupHandler): (() => void) => {
    signOutHandlers.current.add(handler);
    return () => {
      signOutHandlers.current.delete(handler);
    };
  }, []);

  const endSession = useCallback(
    async (notice?: string | null): Promise<void> => {
      // Best-effort session cleanup (e.g. device unregistration) must run before
      // tokens are cleared so handlers can still authenticate their requests.
      for (const handler of signOutHandlers.current) {
        try {
          await handler();
        } catch {
          // A failing cleanup never blocks the local sign-out.
        }
      }
      await tokenStorage.clearTokens();
      queryClient.clear();
      dispatch({ type: 'unauthenticated', notice: notice ?? null });
    },
    [queryClient]
  );

  useEffect(() => {
    return apiClient.setSessionInvalidatedHandler((message) => {
      queryClient.clear();
      dispatch({ type: 'unauthenticated', notice: message ?? null });
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
      } catch (error) {
        if (isNetworkError(error)) {
          if (active) {
            dispatch({ type: 'unauthenticated' });
          }
          return;
        }
        await tokenStorage.clearTokens();
        queryClient.clear();
        if (active) {
          dispatch({
            type: 'unauthenticated',
            notice: error instanceof ApiError ? error.message : null,
          });
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
      await endSession();
    }
  }, [endSession]);

  return (
    <SessionContext
      value={{
        ...state,
        endSession,
        registerSignOutHandler,
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
