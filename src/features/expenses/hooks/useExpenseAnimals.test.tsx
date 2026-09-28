import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { ApiError } from '@/core/api';
import { animalOptionsApi } from '@/application/animals';

import { useExpenseAnimals } from './useExpenseAnimals';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('useExpenseAnimals', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false, gcTime: 0 },
        queries: { retry: false, gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('opens the form with a single animal when the list fails and animalId is valid', async () => {
    jest.spyOn(animalOptionsApi, 'list').mockRejectedValue(
      new ApiError({
        code: 'HTTP_500',
        message: 'Ocurrió un error en el servidor. Intenta nuevamente.',
        requestId: 'req-1',
        status: 500,
      })
    );
    jest.spyOn(animalOptionsApi, 'getById').mockResolvedValue({ id: ANIMAL_ID, name: 'Luna' });

    const { result } = await renderHook(() => useExpenseAnimals(ANIMAL_ID), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([{ id: ANIMAL_ID, name: 'Luna' }]));
    expect(result.current.isFallback).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('exposes a mapped message when the list fails without a fallback animal', async () => {
    jest.spyOn(animalOptionsApi, 'list').mockRejectedValue(
      new ApiError({
        code: 'HTTP_500',
        message: 'Ocurrió un error en el servidor. Intenta nuevamente.',
        requestId: 'req-1',
        status: 500,
      })
    );

    const { result } = await renderHook(() => useExpenseAnimals(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe(
      'Ocurrió un error en el servidor. Intenta nuevamente.'
    );
  });
});
