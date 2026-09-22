import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalEventsApi } from '../api/animalEventsApi';
import type { AnimalHistoryEventResponse, CreateAnimalHistoryEventRequest } from '../types';

import { animalKeys } from './animalKeys';

export function useCreateAnimalEvent(animalId: string) {
  const queryClient = useQueryClient();

  return useMutation<AnimalHistoryEventResponse, Error, CreateAnimalHistoryEventRequest>({
    mutationFn: (event) => animalEventsApi.create(animalId, event),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: animalKeys.history(animalId) });
    },
  });
}
