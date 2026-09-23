import { useQuery } from '@tanstack/react-query';

import { animalsApi } from '../api/animalsApi';
import type { Animal } from '../types';

import { animalKeys } from './animalKeys';

export function useAnimal(id: string) {
  return useQuery<Animal>({
    queryKey: animalKeys.detail(id),
    queryFn: () => animalsApi.getById(id),
    enabled: id !== '',
    retry: 1,
    staleTime: 30_000,
  });
}
