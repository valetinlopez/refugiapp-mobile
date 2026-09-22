import type { CareTaskFilters } from '../types';

export const careTaskKeys = {
  all: ['care-tasks'] as const,
  lists: () => [...careTaskKeys.all, 'list'] as const,
  list: (filters: CareTaskFilters) => [...careTaskKeys.lists(), filters] as const,
  detail: (id: string) => [...careTaskKeys.all, 'detail', id] as const,
  animals: ['care-tasks', 'animal-options'] as const,
};

export const dashboardQueryKey = ['dashboard'] as const;
