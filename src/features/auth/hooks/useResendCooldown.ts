import { useCallback, useEffect, useState } from 'react';

// Evita chocar con el rate limit LOGIN del backend (5/min): entre un envío y el
// siguiente media este cooldown, con el botón deshabilitado y cuenta regresiva.
export const RESEND_COOLDOWN_SECONDS = 60;

export function useResendCooldown(): { remaining: number; start: () => void } {
  const [remaining, setRemaining] = useState(0);

  const start = useCallback(() => {
    setRemaining(RESEND_COOLDOWN_SECONDS);
  }, []);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }
    const interval = setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  return { remaining, start };
}
