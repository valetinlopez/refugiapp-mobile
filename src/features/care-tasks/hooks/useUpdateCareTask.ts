import { useMutation, useQueryClient } from '@tanstack/react-query';

import { careTasksApi } from '../api/careTasksApi';
import type { CareTask, UpdateCareTaskRequest } from '../types';

import { careTaskKeys } from './careTaskKeys';
import { invalidateCareTaskQueries } from './invalidateCareTaskQueries';

export function useUpdateCareTask(id: string) {
  const queryClient = useQueryClient();
  return useMutation<CareTask, Error, UpdateCareTaskRequest>({
    mutationFn: (data) => careTasksApi.update(id, data),
    onSuccess: async (task) => {
      queryClient.setQueryData(careTaskKeys.detail(id), task);
      await invalidateCareTaskQueries(queryClient);
    },
  });
}
