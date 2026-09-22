import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalsApi } from '../api/animalsApi';
import type { Animal, PaginatedAnimals } from '../types';

import { useAnimals } from './useAnimals';

function createAnimal(id: string, name: string): Animal {
  return {
    id,
    name,
    species: 'dog',
    breed: null,
    sex: 'female',
    status: 'admitted',
    intakeDate: '2026-01-10',
    birthDate: null,
    profilePhotoMediaId: null,
  };
}

function createPage(items: Animal[], page: number, total: number): PaginatedAnimals {
  return { items, page, limit: 20, total };
}

describe('useAnimals', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('fetches the first page and exposes the animals', async () => {
    const getAll = jest
      .spyOn(animalsApi, 'getAll')
      .mockResolvedValue(createPage([createAnimal('id-1', 'Luna')], 1, 1));
    const { result } = await renderHook(() => useAnimals(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getAll).toHaveBeenCalledWith({}, 1, 20);
    expect(result.current.data?.pages[0]?.items[0]?.name).toBe('Luna');
  });

  it('passes the filters to the api', async () => {
    const getAll = jest.spyOn(animalsApi, 'getAll').mockResolvedValue(createPage([], 1, 0));
    const { result } = await renderHook(
      () => useAnimals({ status: 'available_for_adoption', name: 'luna' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getAll).toHaveBeenCalledWith({ status: 'available_for_adoption', name: 'luna' }, 1, 20);
  });

  it('loads the next page while one exists', async () => {
    const getAll = jest
      .spyOn(animalsApi, 'getAll')
      .mockResolvedValueOnce(createPage([createAnimal('id-1', 'Luna')], 1, 25))
      .mockResolvedValueOnce(createPage([createAnimal('id-2', 'Rex')], 2, 25));
    const { result } = await renderHook(() => useAnimals(), { wrapper });

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(1);
    });

    await result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
    });
    expect(getAll).toHaveBeenNthCalledWith(2, {}, 2, 20);
    expect(result.current.hasNextPage).toBe(false);
  });
});
