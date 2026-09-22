import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalEventsApi } from '../api/animalEventsApi';
import type { PaginatedAnimalHistoryEvents } from '../types';

import { useAnimalHistory } from './useAnimalHistory';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createPage(): PaginatedAnimalHistoryEvents {
  return {
    items: [
      {
        id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
        animalId: ANIMAL_ID,
        eventType: 'status_change',
        description: 'Pasó a disponible para adopción.',
        occurredAt: '2026-09-21T14:30:00.000Z',
        createdByUserId: null,
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
  };
}

describe('useAnimalHistory', () => {
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

  it('fetches the history for an animal', async () => {
    const list = jest.spyOn(animalEventsApi, 'list').mockResolvedValue(createPage());
    const { result } = await renderHook(() => useAnimalHistory(ANIMAL_ID), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(list).toHaveBeenCalledWith(ANIMAL_ID, {});
    expect(result.current.data?.items[0]?.eventType).toBe('status_change');
  });

  it('is disabled when no animal id is provided', async () => {
    const list = jest.spyOn(animalEventsApi, 'list');
    const { result } = await renderHook(() => useAnimalHistory(''), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(list).not.toHaveBeenCalled();
  });

  it('exposes a 403 as an error state', async () => {
    jest.spyOn(animalEventsApi, 'list').mockRejectedValue({ status: 403 });
    const { result } = await renderHook(() => useAnimalHistory(ANIMAL_ID), { wrapper });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 }
    );
  });
});
