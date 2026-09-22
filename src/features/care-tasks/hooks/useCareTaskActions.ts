import { useMutation, useQueryClient } from '@tanstack/react-query';

import { careTasksApi } from '../api/careTasksApi';
import type { CareTask } from '../types';

import { invalidateCareTaskQueries } from './invalidateCareTaskQueries';

export function useCompleteCareTask() {
  const queryClient = useQueryClient();
  return useMutation<CareTask, Error, string>({
    mutationFn: (id) => careTasksApi.complete(id),
    onSuccess: () => invalidateCareTaskQueries(queryClient),
  });
}

export function useCancelCareTask() {
  const queryClient = useQueryClient();
  return useMutation<CareTask, Error, string>({
    mutationFn: (id) => careTasksApi.cancel(id),
    onSuccess: () => invalidateCareTaskQueries(queryClient),
  });
}
