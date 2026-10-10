import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { homeApi } from './homeApi';
import { homeKeys } from './homeKeys';
import { buildHomePriorities, type HomePriority } from './homePriorities';

const SUMMARY_STALE_TIME = 30_000;
const COUNT_STALE_TIME = 60_000;

export interface UseHomeSummaryResult {
  /** True only while none of the summary queries has data yet. */
  isPending: boolean;
  pendingCareTaskCount: number | undefined;
  pendingCareTaskCountIsError: boolean;
  priorities: HomePriority[];
  prioritiesIsError: boolean;
  prioritiesIsPending: boolean;
  expenseCount: number | undefined;
  expenseCountIsError: boolean;
  /** Refetches the three summary queries together (used by pull-to-refresh). */
  refetch(): Promise<unknown>;
}

/**
 * Composed read-only summary for Inicio (D36 / RFG-169).
 *
 * All queries are best-effort: their failure degrades a single indicator instead
 * of the whole dashboard, so the screen keeps rendering with the overview it
 * already has. Query keys live in `homeKeys`, shared by prefix for invalidation.
 */
export function useHomeSummary(): UseHomeSummaryResult {
  const pendingCountQuery = useQuery({
    queryKey: homeKeys.pendingCount(),
    queryFn: () => homeApi.getPendingCareTaskCount(),
    retry: 1,
    staleTime: SUMMARY_STALE_TIME,
  });

  const prioritiesQuery = useQuery({
    queryKey: homeKeys.priorities(),
    queryFn: () => homeApi.listPendingCareTasks(),
    retry: 1,
    staleTime: SUMMARY_STALE_TIME,
  });

  const expenseCountQuery = useQuery({
    queryKey: homeKeys.expenseCount(),
    queryFn: () => homeApi.getExpenseCount(),
    retry: 1,
    staleTime: COUNT_STALE_TIME,
  });

  const priorities = useMemo(
    () => buildHomePriorities(prioritiesQuery.data ?? []),
    [prioritiesQuery.data]
  );

  const { refetch: refetchPendingCount } = pendingCountQuery;
  const { refetch: refetchPriorities } = prioritiesQuery;
  const { refetch: refetchExpenseCount } = expenseCountQuery;

  const refetch = useCallback(
    () => Promise.all([refetchPendingCount(), refetchPriorities(), refetchExpenseCount()]),
    [refetchExpenseCount, refetchPendingCount, refetchPriorities]
  );

  return {
    isPending:
      pendingCountQuery.isPending && prioritiesQuery.isPending && expenseCountQuery.isPending,
    pendingCareTaskCount: pendingCountQuery.data,
    pendingCareTaskCountIsError: pendingCountQuery.isError,
    priorities,
    prioritiesIsError: prioritiesQuery.isError,
    prioritiesIsPending: prioritiesQuery.isPending,
    expenseCount: expenseCountQuery.data,
    expenseCountIsError: expenseCountQuery.isError,
    refetch,
  };
}
