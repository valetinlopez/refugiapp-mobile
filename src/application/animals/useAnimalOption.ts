import { useQuery } from '@tanstack/react-query';

import { animalOptionsApi } from './animalOptionsApi';
import { animalOptionsKeys } from './animalOptionsKeys';

export function useAnimalOption(animalId: string | undefined, enabled = false) {
  return useQuery({
    queryKey: animalOptionsKeys.detail(animalId ?? ''),
    queryFn: async () => {
      if (animalId === undefined) {
        throw new Error('Animal id is required.');
      }
      return animalOptionsApi.getById(animalId);
    },
    enabled: enabled && animalId !== undefined,
  });
}
