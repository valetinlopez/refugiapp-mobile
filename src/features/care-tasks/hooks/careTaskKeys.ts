import type { CareTaskFilters } from '../types';

export const careTaskKeys = {
  all: ['care-tasks'] as const,
  lists: () => [...careTaskKeys.all, 'list'] as const,
  list: (filters: CareTaskFilters) => [...careTaskKeys.lists(), filters] as const,
  infiniteList: (filters: CareTaskFilters) =>
    [...careTaskKeys.lists(), 'infinite', filters] as const,
  counts: () => [...careTaskKeys.all, 'counts'] as const,
  count: (filters: CareTaskFilters) => [...careTaskKeys.counts(), filters] as const,
  detail: (id: string) => [...careTaskKeys.all, 'detail', id] as const,
};

export const dashboardQueryKey = ['dashboard'] as const;
