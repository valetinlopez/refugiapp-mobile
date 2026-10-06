import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { adoptionsApi } from '../api/adoptionsApi';
import { adoptionKeys } from './adoptionKeys';

const PAGE_SIZE = 20;

export function useAdoptionApplications(animalId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: adoptionKeys.applications(animalId),
    queryFn: ({ pageParam }) => adoptionsApi.listApplications(animalId, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled: enabled && animalId !== '',
    retry: 1,
  });
}

export function useAdoptionHistory(animalId: string) {
  return useInfiniteQuery({
    queryKey: adoptionKeys.history(animalId),
    queryFn: ({ pageParam }) => adoptionsApi.listHistory(animalId, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled: animalId !== '',
    retry: 1,
  });
}

export function useAdopter(adopterId: string, enabled = true) {
  return useQuery({
    queryKey: adoptionKeys.adopter(adopterId),
    queryFn: () => adoptionsApi.getAdopter(adopterId),
    enabled: enabled && adopterId !== '',
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}
