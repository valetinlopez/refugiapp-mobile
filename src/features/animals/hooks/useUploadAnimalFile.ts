import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { UploadCancelledError } from '@/core/media';

import { animalFilesApi, type AnimalFileUpload } from '../api/animalFilesApi';
import type { MediaAsset } from '../types';

import { animalKeys } from './animalKeys';

export interface UploadAnimalFileInput {
  file: AnimalFileUpload;
}

export interface AnimalFileUploadState {
  fileName: string;
  progress: number;
}

export function useUploadAnimalFile(animalId: string) {
  const queryClient = useQueryClient();
  const abortController = useRef<AbortController | null>(null);
  const [upload, setUpload] = useState<AnimalFileUploadState | null>(null);

  const mutation = useMutation<MediaAsset, unknown, UploadAnimalFileInput>({
    mutationFn: async ({ file }) => {
      abortController.current = new AbortController();
      setUpload({ fileName: file.name, progress: 0 });
      try {
        return await animalFilesApi.uploadToAnimal(animalId, file, undefined, {
          signal: abortController.current.signal,
          onUploadProgress: (progress) => setUpload({ fileName: file.name, progress }),
        });
      } catch (error) {
        if (abortController.current?.signal.aborted) throw new UploadCancelledError();
        throw error;
      } finally {
        setUpload(null);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: animalKeys.files(animalId) });
    },
    onSettled: () => {
      abortController.current = null;
      setUpload(null);
    },
  });

  return { ...mutation, cancelUpload: () => abortController.current?.abort(), upload };
}
