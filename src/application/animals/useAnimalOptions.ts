import { useQuery } from '@tanstack/react-query';

import { animalOptionsApi } from './animalOptionsApi';
import { animalOptionsKeys } from './animalOptionsKeys';

const OPTIONS_STALE_TIME = 5 * 60 * 1000;

export function useAnimalOptions() {
  return useQuery({
    queryKey: animalOptionsKeys.list(),
    queryFn: () => animalOptionsApi.list(),
    staleTime: OPTIONS_STALE_TIME,
  });
}
