import { useQuery } from '@tanstack/react-query';

import { careTasksApi } from '../api/careTasksApi';

import { careTaskKeys } from './careTaskKeys';

export function useCareTask(id: string) {
  return useQuery({
    queryKey: careTaskKeys.detail(id),
    queryFn: () => careTasksApi.getById(id),
    enabled: id !== '',
    retry: 1,
  });
}
