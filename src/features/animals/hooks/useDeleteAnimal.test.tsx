import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalsApi } from '../api/animalsApi';
import { animalKeys } from './animalKeys';
import { useDeleteAnimal } from './useDeleteAnimal';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('useDeleteAnimal', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false, gcTime: 0 }, queries: { retry: false } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('removes the detail query and invalidates animal lists after delete', async () => {
    jest.spyOn(animalsApi, 'remove').mockResolvedValue(undefined);
    const removeQueries = jest.spyOn(queryClient, 'removeQueries');
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useDeleteAnimal(), { wrapper });

    result.current.mutate(ANIMAL_ID);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(animalsApi.remove).toHaveBeenCalledWith(ANIMAL_ID);
    expect(removeQueries).toHaveBeenCalledWith({ queryKey: animalKeys.detail(ANIMAL_ID) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: animalKeys.lists() });
  });
});
