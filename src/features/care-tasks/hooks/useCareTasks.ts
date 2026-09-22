import { useQuery } from '@tanstack/react-query';

import { careTasksApi } from '../api/careTasksApi';
import type { CareTaskFilters } from '../types';

import { careTaskKeys } from './careTaskKeys';

export function useCareTasks(filters: CareTaskFilters = {}) {
  return useQuery({
    queryKey: careTaskKeys.list(filters),
    queryFn: () => careTasksApi.list(filters),
    retry: 1,
  });
}
