import { useInfiniteQuery } from '@tanstack/react-query';

import { animalsApi } from '../api/animalsApi';
import type { AnimalListFilters } from '../types';

import { animalKeys } from './animalKeys';

const DEFAULT_PAGE_SIZE = 20;

export function useAnimals(filters: AnimalListFilters = {}) {
  return useInfiniteQuery({
    queryKey: [...animalKeys.lists(), filters],
    queryFn: ({ pageParam }) => animalsApi.getAll(filters, pageParam, DEFAULT_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    retry: 1,
  });
}
