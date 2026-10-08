import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';

import { careTasksApi } from '../api/careTasksApi';
import type { CareTaskFilters } from '../types';

import { careTaskKeys } from './careTaskKeys';

const PAGE_SIZE = 20;
const COUNT_LIMIT = 1;
const COUNT_STATUSES = ['pending', 'completed', 'cancelled'] as const;

export function useCareTasks(filters: CareTaskFilters = {}) {
  return useQuery({
    queryKey: careTaskKeys.list(filters),
    queryFn: () => careTasksApi.list(filters),
    retry: 1,
  });
}

export function useInfiniteCareTasks(filters: CareTaskFilters = {}) {
  return useInfiniteQuery({
    queryKey: careTaskKeys.infiniteList(filters),
    queryFn: ({ pageParam }) => careTasksApi.list(filters, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    retry: 1,
  });
}

export function useCareTaskCounts(animalId?: string) {
  const results = useQueries({
    queries: COUNT_STATUSES.map((status) => {
      const filters: CareTaskFilters = {
        status,
        ...(animalId !== undefined ? { animalId } : {}),
      };

      return {
        queryKey: careTaskKeys.count(filters),
        queryFn: () => careTasksApi.list(filters, 1, COUNT_LIMIT),
        select: (data: Awaited<ReturnType<typeof careTasksApi.list>>) => data.total,
        retry: 1,
      };
    }),
  });

  return {
    counts: {
      pending: results[0]?.data,
      completed: results[1]?.data,
      cancelled: results[2]?.data,
    },
    isError: results.some((result) => result.isError),
    isPending: results.some((result) => result.isPending),
    refetch: () => Promise.all(results.map((result) => result.refetch())),
  };
}

export function flattenCareTaskPages(
  pages: readonly import('../types').PaginatedCareTasks[] | undefined
): import('../types').CareTask[] {
  const seen = new Set<string>();
  const tasks: import('../types').CareTask[] = [];

  for (const page of pages ?? []) {
    for (const task of page.items) {
      if (seen.has(task.id)) continue;
      seen.add(task.id);
      tasks.push(task);
    }
  }

  return tasks;
}
