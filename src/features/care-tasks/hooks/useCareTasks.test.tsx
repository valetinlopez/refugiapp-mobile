import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { careTasksApi } from '../api/careTasksApi';
import type { CareTask, CareTaskStatus, PaginatedCareTasks } from '../types';
import { flattenCareTaskPages, useCareTaskCounts, useInfiniteCareTasks } from './useCareTasks';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createTask(id: string): CareTask {
  return {
    id,
    animalId: ANIMAL_ID,
    title: 'Dar medicación',
    description: null,
    status: 'pending',
    dueAt: null,
    completedAt: null,
    createdByUserId: null,
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  };
}

function createPage(page = 1, total = 1): PaginatedCareTasks {
  return {
    items: [createTask(String(page) + 'fa85f64-5717-4562-b3fc-2c963f66afa6')],
    page,
    limit: 20,
    total,
  };
}

describe('care task overview queries', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: 0, retry: false } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('loads the global list in deterministic pages of 20', async () => {
    const list = jest
      .spyOn(careTasksApi, 'list')
      .mockResolvedValueOnce(createPage(1, 21))
      .mockResolvedValueOnce(createPage(2, 21));
    const { result } = await renderHook(
      () => useInfiniteCareTasks({ animalId: ANIMAL_ID, status: 'pending' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(list).toHaveBeenNthCalledWith(1, { animalId: ANIMAL_ID, status: 'pending' }, 1, 20);
    expect(list).toHaveBeenNthCalledWith(2, { animalId: ANIMAL_ID, status: 'pending' }, 2, 20);
    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });

  it('uses exactly three limit-one queries that share the animal filter', async () => {
    const totals: Record<CareTaskStatus, number> = {
      pending: 7,
      completed: 18,
      cancelled: 3,
    };
    const list = jest
      .spyOn(careTasksApi, 'list')
      .mockImplementation(async (filters = {}, page = 1, limit = 20) => ({
        items: [],
        page,
        limit,
        total: totals[filters.status ?? 'pending'],
      }));
    const { result } = await renderHook(() => useCareTaskCounts(ANIMAL_ID), { wrapper });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    for (const status of ['pending', 'completed', 'cancelled'] as const) {
      expect(list).toHaveBeenCalledWith({ animalId: ANIMAL_ID, status }, 1, 1);
    }
    expect(list).toHaveBeenCalledTimes(3);
    expect(result.current.counts).toEqual(totals);
  });
});

describe('flattenCareTaskPages', () => {
  it('deduplicates overlapping ids while preserving backend order', () => {
    const first = createPage();
    const repeated = first.items[0]!;
    const second = {
      ...createPage(2, 2),
      items: [repeated, createTask('9fa85f64-5717-4562-b3fc-2c963f66afa6')],
    };

    expect(flattenCareTaskPages([first, second]).map((task) => task.id)).toEqual([
      repeated.id,
      second.items[1]!.id,
    ]);
  });
});
