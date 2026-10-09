import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { veterinarianDirectoryApi } from './veterinarianDirectoryApi';
import { veterinarianDirectoryKeys } from './veterinarianDirectoryKeys';

const DIRECTORY_STALE_TIME = 5 * 60 * 1000;

export const NO_VETERINARIAN_LABEL = 'Sin veterinario asignado';
export const UNAVAILABLE_VETERINARIAN_LABEL = 'Veterinario no disponible';

/**
 * Resolves a veterinarian label from the shared directory without a request per
 * row: a `null` id is "Sin veterinario asignado" and an id that is inactive or
 * outside the loaded page degrades to an explicit fallback, never a raw UUID.
 */
export function resolveVeterinarianLabel(
  namesById: ReadonlyMap<string, string>,
  veterinarianId: string | null
): string {
  if (veterinarianId === null) return NO_VETERINARIAN_LABEL;
  return namesById.get(veterinarianId) ?? UNAVAILABLE_VETERINARIAN_LABEL;
}

export function useVeterinarianDirectory() {
  const query = useQuery({
    queryKey: veterinarianDirectoryKeys.directory(),
    queryFn: () => veterinarianDirectoryApi.listActive(),
    retry: 1,
    staleTime: DIRECTORY_STALE_TIME,
  });

  const namesById = useMemo(
    () => new Map((query.data ?? []).map((entry) => [entry.id, entry.name])),
    [query.data]
  );

  return { ...query, namesById };
}
