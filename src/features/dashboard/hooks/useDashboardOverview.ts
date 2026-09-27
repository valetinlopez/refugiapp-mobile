import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '../api/dashboardApi';
import type { DashboardOverview } from '../types';

import { dashboardKeys } from './dashboardKeys';

export function useDashboardOverview() {
  return useQuery<DashboardOverview>({
    queryKey: dashboardKeys.overview(),
    queryFn: () => dashboardApi.getOverview(),
    retry: 1,
    staleTime: 30_000,
  });
}
