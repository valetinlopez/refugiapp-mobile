import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalsApi } from '../api/animalsApi';
import type { Animal } from '../types';

import { animalKeys } from './animalKeys';
import { useChangeAnimalStatus } from './useChangeAnimalStatus';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createAnimal(status: Animal['status']): Animal {
  return {
    id: ANIMAL_ID,
    name: 'Luna',
    species: 'dog',
    breed: null,
    sex: 'female',
    status,
    intakeDate: '2026-01-10',
    birthDate: null,
    profilePhotoMediaId: null,
  };
}

describe('useChangeAnimalStatus', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false, gcTime: 0 },
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('changes the status and invalidates the list', async () => {
    const changeStatus = jest
      .spyOn(animalsApi, 'changeStatus')
      .mockResolvedValue(createAnimal('available_for_adoption'));
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useChangeAnimalStatus(ANIMAL_ID), { wrapper });

    result.current.mutate({ status: 'available_for_adoption' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(changeStatus).toHaveBeenCalledWith(ANIMAL_ID, { status: 'available_for_adoption' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: animalKeys.all });
  });

  it('exposes a 409 conflict as an error without touching the cache', async () => {
    jest.spyOn(animalsApi, 'changeStatus').mockRejectedValue({ status: 409 });
    const { result } = await renderHook(() => useChangeAnimalStatus(ANIMAL_ID), { wrapper });

    result.current.mutate({ status: 'adopted' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toMatchObject({ status: 409 });
  });
});
