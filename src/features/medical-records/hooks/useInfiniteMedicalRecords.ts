import { useInfiniteQuery } from '@tanstack/react-query';

import { medicalRecordsApi } from '../api/medicalRecordsApi';
import type { MedicalRecord, MedicalRecordFilters, PaginatedMedicalRecords } from '../types';

import { medicalRecordKeys } from './medicalRecordKeys';

const PAGE_SIZE = 20;

export function useInfiniteMedicalRecords(filters: MedicalRecordFilters = {}) {
  return useInfiniteQuery({
    queryKey: medicalRecordKeys.infiniteList(filters),
    queryFn: ({ pageParam }) => medicalRecordsApi.list(filters, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    retry: 1,
  });
}

/**
 * Flattens paginated medical-record pages, de-duplicating UUIDs while preserving
 * the backend order (`occurredAt DESC, id DESC`). Overlapping pages can repeat an
 * item at the boundary; the first occurrence wins and the client never reorders.
 */
export function flattenMedicalRecordPages(
  pages: readonly PaginatedMedicalRecords[] | undefined
): MedicalRecord[] {
  const seen = new Set<string>();
  const records: MedicalRecord[] = [];

  for (const page of pages ?? []) {
    for (const record of page.items) {
      if (seen.has(record.id)) continue;
      seen.add(record.id);
      records.push(record);
    }
  }

  return records;
}
