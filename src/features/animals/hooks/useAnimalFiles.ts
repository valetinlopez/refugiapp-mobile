import { useInfiniteQuery } from '@tanstack/react-query';

import { animalFilesApi } from '../api/animalFilesApi';

import { animalKeys } from './animalKeys';

const PAGE_SIZE = 20;

export function useAnimalFiles(animalId: string) {
  return useInfiniteQuery({
    queryKey: animalKeys.files(animalId),
    queryFn: ({ pageParam }) => animalFilesApi.listByAnimal(animalId, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    enabled: animalId !== '',
    retry: 1,
  });
}
