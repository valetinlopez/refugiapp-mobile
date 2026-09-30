import { useQuery } from '@tanstack/react-query';

import { veterinariansApi } from '../api/veterinariansApi';
import { veterinarianKeys } from './veterinarianKeys';

export function useVeterinarian(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && id.length > 0,
    queryKey: veterinarianKeys.detail(id),
    queryFn: () => veterinariansApi.getById(id),
    retry: 1,
  });
}
