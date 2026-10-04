import { useInfiniteQuery } from '@tanstack/react-query';

import { medicalRecordChangesApi } from '../api/medicalRecordChangesApi';
import type { MedicalRecordChangeFilters } from '../types';

import { medicalRecordKeys } from './medicalRecordKeys';

const PAGE_SIZE = 20;

export function useMedicalRecordChanges(
  recordId: string,
  filters: MedicalRecordChangeFilters = {}
) {
  return useInfiniteQuery({
    enabled: recordId !== '',
    queryKey: medicalRecordKeys.changes(recordId, filters),
    queryFn: ({ pageParam }) =>
      medicalRecordChangesApi.listChanges(recordId, pageParam, PAGE_SIZE, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    retry: 1,
  });
}
