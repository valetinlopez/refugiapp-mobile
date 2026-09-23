import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalsApi } from '../api/animalsApi';
import type { Animal } from '../types';

import { useAnimal } from './useAnimal';

function createAnimal(): Animal {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Luna',
    species: 'dog',
    breed: null,
    sex: 'female',
    status: 'admitted',
    intakeDate: '2026-01-10',
    birthDate: null,
    profilePhotoMediaId: null,
  };
}

describe('useAnimal', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        // gcTime: 0 avoids the 5-minute query gc timer keeping jest open.
        queries: { retry: false, gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('fetches and exposes the animal detail', async () => {
    const getById = jest.spyOn(animalsApi, 'getById').mockResolvedValue(createAnimal());
    const { result } = await renderHook(() => useAnimal('3fa85f64-5717-4562-b3fc-2c963f66afa6'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(getById).toHaveBeenCalledWith('3fa85f64-5717-4562-b3fc-2c963f66afa6');
    expect(result.current.data?.name).toBe('Luna');
  });

  it('uses a freshly cached animal without requesting it again', async () => {
    const getById = jest.spyOn(animalsApi, 'getById');
    const animal = createAnimal();
    queryClient.setQueryData(['animals', 'detail', animal.id], animal);

    const { result } = await renderHook(() => useAnimal(animal.id), { wrapper });

    expect(result.current.data).toEqual(animal);
    expect(getById).not.toHaveBeenCalled();
  });

  it('is disabled when no id is provided', async () => {
    const getById = jest.spyOn(animalsApi, 'getById');
    const { result } = await renderHook(() => useAnimal(''), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(getById).not.toHaveBeenCalled();
  });

  it('exposes a 404 as an error state', async () => {
    jest.spyOn(animalsApi, 'getById').mockRejectedValue({ status: 404 });
    const { result } = await renderHook(() => useAnimal('3fa85f64-5717-4562-b3fc-2c963f66afa6'), {
      wrapper,
    });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 }
    );
  });
});
