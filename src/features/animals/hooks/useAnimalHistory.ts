import { useQuery } from '@tanstack/react-query';

import { animalEventsApi, type AnimalHistoryFilters } from '../api/animalEventsApi';

import { animalKeys } from './animalKeys';

export function useAnimalHistory(animalId: string, filters: AnimalHistoryFilters = {}) {
  return useQuery({
    queryKey: [...animalKeys.history(animalId), filters],
    queryFn: () => animalEventsApi.list(animalId, filters),
    enabled: animalId !== '',
    retry: 1,
  });
}
