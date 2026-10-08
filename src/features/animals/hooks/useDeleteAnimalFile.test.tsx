import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalFilesApi } from '../api/animalFilesApi';

import { animalKeys } from './animalKeys';
import { useDeleteAnimalFile } from './useDeleteAnimalFile';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('useDeleteAnimalFile', () => {
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

  it('deletes the asset and invalidates the animal files query', async () => {
    const remove = jest.spyOn(animalFilesApi, 'deleteAsset').mockResolvedValue(undefined);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useDeleteAnimalFile(ANIMAL_ID), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('file-1');
    });

    expect(remove).toHaveBeenCalledWith('file-1');
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: animalKeys.files(ANIMAL_ID) })
    );
  });

  it('surfaces a 403 without invalidating the cache', async () => {
    jest.spyOn(animalFilesApi, 'deleteAsset').mockRejectedValue({ status: 403 });
    const { result } = await renderHook(() => useDeleteAnimalFile(ANIMAL_ID), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('file-1')).rejects.toMatchObject({ status: 403 });
    });

    await waitFor(() => expect(result.current.error).toMatchObject({ status: 403 }));
  });
});
