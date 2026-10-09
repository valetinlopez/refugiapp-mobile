import { useInfiniteQuery } from '@tanstack/react-query';

import { veterinariansApi } from '../api/veterinariansApi';
import type {
  PaginatedVeterinariansResponse,
  VeterinarianListFilters,
  VeterinarianResponse,
} from '../types';

import { veterinarianKeys } from './veterinarianKeys';

const PAGE_SIZE = 20;

export type { VeterinarianListFilters } from '../types';

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

/**
 * Flattens paginated veterinarian pages, de-duplicating UUIDs while preserving
 * the deterministic backend order (`lastName ASC, firstName ASC, id ASC`).
 * Overlapping pages can repeat an item at the boundary; the first occurrence
 * wins, so the list never renders duplicated rows.
 */
export function flattenVeterinarianPages(
  pages: readonly PaginatedVeterinariansResponse[] | undefined
): VeterinarianResponse[] {
  const seen = new Set<string>();
  const veterinarians: VeterinarianResponse[] = [];

  for (const page of pages ?? []) {
    for (const veterinarian of page.items) {
      if (seen.has(veterinarian.id)) continue;
      seen.add(veterinarian.id);
      veterinarians.push(veterinarian);
    }
  }

  return veterinarians;
}
