import { useInfiniteQuery } from '@tanstack/react-query';

import { veterinariansApi } from '../api/veterinariansApi';
import { veterinarianKeys } from './veterinarianKeys';

const PAGE_SIZE = 20;

export interface VeterinarianListFilters {
  isActive?: boolean;
  licenseNumber?: string;
  name?: string;
}

export function useVeterinarians(filters: VeterinarianListFilters = {}, enabled = true) {
  return useInfiniteQuery({
    enabled,
    queryKey: [...veterinarianKeys.lists(), filters],
    queryFn: ({ pageParam }) =>
      veterinariansApi.list({ ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    retry: 1,
  });
}
