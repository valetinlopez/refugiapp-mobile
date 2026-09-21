import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalsApi } from '../api/animalsApi';
import type { Animal, AnimalStatus } from '../types';

import { animalKeys } from './animalKeys';

export interface ChangeAnimalStatusInput {
  status: AnimalStatus;
}

export function useChangeAnimalStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Animal, Error, ChangeAnimalStatusInput>({
    mutationFn: ({ status }) => animalsApi.changeStatus(id, { status }),
    onSuccess: (updated) => {
      void queryClient.setQueryData(animalKeys.detail(id), updated);
      void queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
  });
}
