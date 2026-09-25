import { useQuery } from '@tanstack/react-query';

import { speciesApi } from '../api/speciesApi';

import { speciesKeys } from './speciesKeys';

export function useSpecies() {
  return useQuery({
    queryKey: speciesKeys.list(),
    queryFn: () => speciesApi.getSpecies(),
    retry: 1,
    staleTime: 60 * 60 * 1000,
  });
}
