import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { UploadCancelledError } from '@/core/media';

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
  const abortController = useRef<AbortController | null>(null);
  const [upload, setUpload] = useState<{ fileName: string; progress: number } | null>(null);

  const mutation = useMutation<Animal, UpdateAnimalError, UpdateAnimalInput>({
    mutationFn: async ({ form, photo }) => {
      let profilePhotoMediaId: string | undefined;

      if (photo !== null) {
        abortController.current = new AbortController();
        setUpload({ fileName: photo.name, progress: 0 });
        try {
          const asset = await mediaApi.uploadOrphanPhoto(photo, undefined, {
            signal: abortController.current.signal,
            onUploadProgress: (progress) => setUpload({ fileName: photo.name, progress }),
          });
          profilePhotoMediaId = asset.id;
        } catch (error) {
          if (abortController.current.signal.aborted) {
            throw new UpdateAnimalError('photo', new UploadCancelledError());
          }
          throw new UpdateAnimalError('photo', error);
        } finally {
          setUpload(null);
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
    onSettled: () => {
      abortController.current = null;
      setUpload(null);
    },
  });

  return { ...mutation, cancelUpload: () => abortController.current?.abort(), upload };
}
