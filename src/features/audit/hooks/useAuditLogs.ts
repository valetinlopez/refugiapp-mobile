import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { auditApi } from '../api/auditApi';
import type { AuditFilters } from '../types';
import { auditKeys } from './auditKeys';

const PAGE_SIZE = 20;

export function useAuditLogs(filters: AuditFilters, enabled = true) {
  return useInfiniteQuery({
    enabled,
    queryKey: auditKeys.list(filters),
    queryFn: ({ pageParam }) => auditApi.list(pageParam, PAGE_SIZE, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    retry: 1,
  });
}

export function useAuditLog(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && id !== '',
    queryKey: auditKeys.detail(id),
    queryFn: () => auditApi.detail(id),
    retry: 1,
  });
}
