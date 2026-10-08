import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { UploadCancelledError } from '@/core/media';

import { animalFilesApi } from '../api/animalFilesApi';

import { animalKeys } from './animalKeys';
import { useUploadAnimalFile } from './useUploadAnimalFile';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const FILE = { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg' };

describe('useUploadAnimalFile', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false, gcTime: 0 } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('uploads and invalidates the animal files query on success', async () => {
    const upload = jest.spyOn(animalFilesApi, 'uploadToAnimal').mockResolvedValue({
      id: 'file-1',
      resourceType: 'image',
      publicId: 'refugiapp/animals/photo',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/photo.jpg',
    });
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useUploadAnimalFile(ANIMAL_ID), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ file: FILE });
    });

    expect(upload).toHaveBeenCalledWith(ANIMAL_ID, FILE, undefined, expect.anything());
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: animalKeys.files(ANIMAL_ID) })
    );
  });

  it('surfaces an upload error without invalidating the cache', async () => {
    jest.spyOn(animalFilesApi, 'uploadToAnimal').mockRejectedValue({ status: 403 });
    const { result } = await renderHook(() => useUploadAnimalFile(ANIMAL_ID), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({ file: FILE })).rejects.toMatchObject({
        status: 403,
      });
    });

    await waitFor(() => expect(result.current.error).toMatchObject({ status: 403 }));
  });

  it('reports a cancelled upload as UploadCancelledError', async () => {
    let capturedSignal: AbortSignal | undefined;
    jest.spyOn(animalFilesApi, 'uploadToAnimal').mockImplementation((_id, _file, _client, opts) => {
      capturedSignal = opts?.signal;
      return new Promise((_resolve, reject) => {
        opts?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    });
    const { result } = await renderHook(() => useUploadAnimalFile(ANIMAL_ID), { wrapper });

    const pending = result.current.mutateAsync({ file: FILE });
    await waitFor(() => expect(capturedSignal).toBeDefined());

    result.current.cancelUpload();

    await act(async () => {
      await expect(pending).rejects.toBeInstanceOf(UploadCancelledError);
    });
  });
});
