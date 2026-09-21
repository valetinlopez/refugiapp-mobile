import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalsApi } from '../api/animalsApi';
import { mediaApi, type PhotoFile } from '../api/mediaApi';
import type { Animal } from '../types';
import { CreateAnimalError } from '../utils/animalErrorMessages';
import type { CreateAnimalFormValues } from '../utils/createAnimalSchema';
import { toCreateAnimalRequest } from '../utils/toCreateAnimalRequest';

import { animalKeys } from './animalKeys';

export interface CreateAnimalInput extends CreateAnimalFormValues {
  photo: PhotoFile | null;
}

export function useCreateAnimal() {
  const queryClient = useQueryClient();

  return useMutation<Animal, CreateAnimalError, CreateAnimalInput>({
    mutationFn: async (input) => {
      let profilePhotoMediaId: string | undefined;

      if (input.photo !== null) {
        try {
          const asset = await mediaApi.uploadOrphanPhoto(input.photo);
          profilePhotoMediaId = asset.id;
        } catch (error) {
          throw new CreateAnimalError('photo', error);
        }
      }

      try {
        return await animalsApi.create(toCreateAnimalRequest(input, profilePhotoMediaId));
      } catch (error) {
        if (profilePhotoMediaId !== undefined) {
          await mediaApi.deleteAsset(profilePhotoMediaId).catch(() => undefined);
        }
        throw new CreateAnimalError('create', error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
  });
}
