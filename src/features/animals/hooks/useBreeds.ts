import { useQuery } from '@tanstack/react-query';

import { speciesApi } from '../api/speciesApi';

import { speciesKeys } from './speciesKeys';

export function useBreeds(speciesId: string | undefined) {
  return useQuery({
    queryKey: speciesKeys.breeds(speciesId ?? ''),
    queryFn: () => speciesApi.getBreeds(speciesId as string),
    enabled: speciesId !== undefined,
    retry: 1,
    staleTime: 60 * 60 * 1000,
  });
}
