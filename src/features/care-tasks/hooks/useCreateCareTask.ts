import { useMutation, useQueryClient } from '@tanstack/react-query';

import { careTasksApi } from '../api/careTasksApi';
import type { CareTask, CreateCareTaskRequest } from '../types';

import { invalidateCareTaskQueries } from './invalidateCareTaskQueries';

export function useCreateCareTask() {
  const queryClient = useQueryClient();
  return useMutation<CareTask, Error, CreateCareTaskRequest>({
    mutationFn: (data) => careTasksApi.create(data),
    onSuccess: () => invalidateCareTaskQueries(queryClient),
  });
}
