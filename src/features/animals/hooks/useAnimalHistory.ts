import { useInfiniteQuery } from '@tanstack/react-query';

import { animalEventsApi, type AnimalHistoryFilters } from '../api/animalEventsApi';
import type { AnimalHistoryEvent, PaginatedAnimalHistoryEvents } from '../types';

import { animalKeys } from './animalKeys';

const PAGE_SIZE = 20;

export function useAnimalHistory(animalId: string, filters: AnimalHistoryFilters = {}) {
  return useInfiniteQuery({
    queryKey: [...animalKeys.history(animalId), filters],
    queryFn: ({ pageParam }) => animalEventsApi.list(animalId, filters, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    enabled: animalId !== '',
    retry: 1,
  });
}

export function flattenAnimalHistoryPages(
  pages: readonly PaginatedAnimalHistoryEvents[] | undefined
): AnimalHistoryEvent[] {
  const seen = new Set<string>();
  const events: AnimalHistoryEvent[] = [];

  for (const page of pages ?? []) {
    for (const event of page.items) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      events.push(event);
    }
  }

  return events;
}
