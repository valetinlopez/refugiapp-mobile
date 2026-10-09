import { useQuery } from '@tanstack/react-query';

import { veterinarianDirectoryApi } from './veterinarianDirectoryApi';
import { veterinarianDirectoryKeys } from './veterinarianDirectoryKeys';

export function useVeterinarianDirectoryEntry(
  veterinarianId: string | null | undefined,
  enabled = true
) {
  const hasVeterinarian = typeof veterinarianId === 'string' && veterinarianId.length > 0;

  return useQuery({
    queryKey: veterinarianDirectoryKeys.detail(veterinarianId ?? ''),
    queryFn: async () => {
      if (!hasVeterinarian) throw new Error('Veterinarian id is required.');
      return veterinarianDirectoryApi.getById(veterinarianId);
    },
    enabled: enabled && hasVeterinarian,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}
