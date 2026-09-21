import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalsApi } from '../api/animalsApi';
import { mediaApi, type PhotoFile } from '../api/mediaApi';
import type { Animal } from '../types';
import { UpdateAnimalError } from '../utils/animalErrorMessages';
import type { UpdateAnimalFormValues } from '../utils/updateAnimalSchema';
import { toUpdateAnimalRequest } from '../utils/toUpdateAnimalRequest';

import { animalKeys } from './animalKeys';

export interface UpdateAnimalInput {
  form: UpdateAnimalFormValues;
  photo: PhotoFile | null;
}

export function useUpdateAnimal(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Animal, UpdateAnimalError, UpdateAnimalInput>({
    mutationFn: async ({ form, photo }) => {
      let profilePhotoMediaId: string | undefined;

      if (photo !== null) {
        try {
          const asset = await mediaApi.uploadOrphanPhoto(photo);
          profilePhotoMediaId = asset.id;
        } catch (error) {
          throw new UpdateAnimalError('photo', error);
        }
      }

      try {
        return await animalsApi.update(id, toUpdateAnimalRequest(form, profilePhotoMediaId));
      } catch (error) {
        if (profilePhotoMediaId !== undefined) {
          await mediaApi.deleteAsset(profilePhotoMediaId).catch(() => undefined);
        }
        throw new UpdateAnimalError('update', error);
      }
    },
    onSuccess: (updated) => {
      void queryClient.setQueryData(animalKeys.detail(id), updated);
      void queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
  });
}
