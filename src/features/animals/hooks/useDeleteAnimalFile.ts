import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalFilesApi } from '../api/animalFilesApi';

import { animalKeys } from './animalKeys';

export function useDeleteAnimalFile(animalId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (id) => animalFilesApi.deleteAsset(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: animalKeys.files(animalId) });
    },
  });
}
