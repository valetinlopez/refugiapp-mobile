import { useCallback, useState } from 'react';

import { useSession } from './SessionProvider';

export function useSignOut() {
  const { signOut: clearSession } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    if (isSigningOut) {
      return;
    }
    setIsSigningOut(true);
    setErrorMessage(null);
    try {
      await clearSession();
    } catch {
      setErrorMessage('No pudimos cerrar la sesión. Revisá tu conexión e intentá de nuevo.');
    } finally {
      setIsSigningOut(false);
    }
  }, [clearSession, isSigningOut]);

  return { errorMessage, isSigningOut, reset, signOut };
}
