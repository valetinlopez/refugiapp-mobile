import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { UploadCancelledError } from '@/core/media';

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
  const abortController = useRef<AbortController | null>(null);
  const [upload, setUpload] = useState<{ fileName: string; progress: number } | null>(null);

  const mutation = useMutation<Animal, CreateAnimalError, CreateAnimalInput>({
    mutationFn: async (input) => {
      let profilePhotoMediaId: string | undefined;

      if (input.photo !== null) {
        abortController.current = new AbortController();
        setUpload({ fileName: input.photo.name, progress: 0 });
        try {
          const asset = await mediaApi.uploadOrphanPhoto(input.photo, undefined, {
            signal: abortController.current.signal,
            onUploadProgress: (progress) =>
              setUpload({ fileName: input.photo?.name ?? '', progress }),
          });
          profilePhotoMediaId = asset.id;
        } catch (error) {
          if (abortController.current.signal.aborted) {
            throw new CreateAnimalError('photo', new UploadCancelledError());
          }
          throw new CreateAnimalError('photo', error);
        } finally {
          setUpload(null);
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
    onSuccess: (animal) => {
      queryClient.setQueryData(animalKeys.detail(animal.id), animal);
      void queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
    },
    onSettled: () => {
      abortController.current = null;
      setUpload(null);
    },
  });

  return { ...mutation, cancelUpload: () => abortController.current?.abort(), upload };
}
