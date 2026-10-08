import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalsApi } from '../api/animalsApi';
import type { Animal, AnimalStatus } from '../types';

import { animalKeys } from './animalKeys';

export interface ChangeAnimalStatusInput {
  status: AnimalStatus;
  /** ISO 8601 local. Omitted, the backend records the current time. */
  occurredAt?: string;
}

export function useChangeAnimalStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Animal, Error, ChangeAnimalStatusInput>({
    mutationFn: ({ occurredAt, status }) =>
      animalsApi.changeStatus(id, occurredAt === undefined ? { status } : { status, occurredAt }),
    onSuccess: (updated) => {
      void queryClient.setQueryData(animalKeys.detail(id), updated);
      void queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
  });
}
