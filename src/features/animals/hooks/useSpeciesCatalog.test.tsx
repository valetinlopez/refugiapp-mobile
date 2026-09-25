import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { speciesApi } from '../api/speciesApi';
import type { Species } from '../types';

import { useBreeds } from './useBreeds';
import { useSpecies } from './useSpecies';

function createSpecies(): Species[] {
  return [
    { id: 'species-dog', slug: 'dog', labelEs: 'Perro' },
    { id: 'species-other', slug: 'other', labelEs: 'Otro' },
  ];
}

describe('useSpecies', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('fetches and exposes the species catalog', async () => {
    const getSpecies = jest.spyOn(speciesApi, 'getSpecies').mockResolvedValue(createSpecies());
    const { result } = await renderHook(() => useSpecies(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getSpecies).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(createSpecies());
  });

  it('exposes an error when the catalog cannot be loaded', async () => {
    jest.spyOn(speciesApi, 'getSpecies').mockRejectedValue({ status: 500 });
    const { result } = await renderHook(() => useSpecies(), { wrapper });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 }
    );
  });
});

describe('useBreeds', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('fetches breeds for the species id', async () => {
    const getBreeds = jest
      .spyOn(speciesApi, 'getBreeds')
      .mockResolvedValue([
        { id: 'breed-1', speciesId: 'species-dog', slug: 'mestizo', labelEs: 'Mestizo' },
      ]);
    const { result } = await renderHook(() => useBreeds('species-dog'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getBreeds).toHaveBeenCalledWith('species-dog');
    expect(result.current.data?.[0]?.slug).toBe('mestizo');
  });

  it('stays disabled without a species id', async () => {
    const getBreeds = jest.spyOn(speciesApi, 'getBreeds');
    const { result } = await renderHook(() => useBreeds(undefined), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(getBreeds).not.toHaveBeenCalled();
  });

  it('exposes a 404 as an error state', async () => {
    jest.spyOn(speciesApi, 'getBreeds').mockRejectedValue({ status: 404 });
    const { result } = await renderHook(() => useBreeds('species-missing'), { wrapper });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 }
    );
  });
});
