import { onlineManager } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useConnectivityStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => onlineManager.isOnline());

  useEffect(() => onlineManager.subscribe(setIsOnline), []);

  return isOnline;
}
