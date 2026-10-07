import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalEventsApi } from '../api/animalEventsApi';
import type { PaginatedAnimalHistoryEvents } from '../types';

import { flattenAnimalHistoryPages, useAnimalHistory } from './useAnimalHistory';

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

    expect(list).toHaveBeenCalledWith(ANIMAL_ID, {}, 1, 20);
    expect(result.current.data?.pages[0]?.items[0]?.eventType).toBe('status_change');
  });

  it('fetches the next page while preserving the server page order', async () => {
    const list = jest
      .spyOn(animalEventsApi, 'list')
      .mockResolvedValueOnce({ ...createPage(), limit: 20, total: 25 })
      .mockResolvedValueOnce({
        ...createPage(),
        items: [
          {
            ...createPage().items[0]!,
            id: '8fa85f64-5717-4562-b3fc-2c963f66afa6',
          },
        ],
        page: 2,
        limit: 20,
        total: 25,
      });
    const { result } = await renderHook(() => useAnimalHistory(ANIMAL_ID), { wrapper });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(list).toHaveBeenLastCalledWith(ANIMAL_ID, {}, 2, 20);
    expect(result.current.data?.pages.map((page) => page.page)).toEqual([1, 2]);
    expect(result.current.hasNextPage).toBe(false);
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

describe('flattenAnimalHistoryPages', () => {
  it('removes overlapping event ids without changing backend order', () => {
    const first = createPage();
    const repeated = first.items[0]!;
    const second = {
      ...createPage(),
      items: [
        repeated,
        {
          ...repeated,
          id: '8fa85f64-5717-4562-b3fc-2c963f66afa6',
          occurredAt: '2026-09-20T14:30:00.000Z',
        },
      ],
      page: 2,
      total: 2,
    };

    expect(flattenAnimalHistoryPages([first, second]).map((event) => event.id)).toEqual([
      repeated.id,
      second.items[1]!.id,
    ]);
  });
});
