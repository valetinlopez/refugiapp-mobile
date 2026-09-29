import { useMemo } from 'react';

import {
  capabilitiesForRoles,
  filterAuthorizedDestinations,
  type RoleCapabilities,
} from '@/application/authorization';

import { useSession } from '../session';

export function useCapabilities(): RoleCapabilities {
  const { user } = useSession();
  return useMemo(() => capabilitiesForRoles(user?.roles ?? []), [user?.roles]);
}

export function useAuthorizedNavigation<T extends object>(destinations: readonly T[]): T[] {
  const capabilities = useCapabilities();
  return useMemo(
    () => filterAuthorizedDestinations(destinations, capabilities),
    [capabilities, destinations]
  );
}
