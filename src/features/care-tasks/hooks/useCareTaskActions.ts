import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { isNetworkError, type MutationRetryQueue } from '@/core/network';

import { careTasksApi } from '../api/careTasksApi';
import type { CareTask } from '../types';

import { invalidateCareTaskQueries } from './invalidateCareTaskQueries';

export function useCompleteCareTask(retryQueue?: MutationRetryQueue) {
  const queryClient = useQueryClient();
  const completeAndInvalidate = useCallback(
    async (id: string): Promise<CareTask> => {
      const completed = await careTasksApi.complete(id);
      await invalidateCareTaskQueries(queryClient);
      return completed;
    },
    [queryClient]
  );
  return useMutation<CareTask, Error, string>({
    mutationFn: completeAndInvalidate,
    onError: (error, id) => {
      if (retryQueue !== undefined && isNetworkError(error)) {
        retryQueue.enqueue({
          key: `care-task-complete:${id}`,
          run: () => completeAndInvalidate(id),
          safeToRetry: true,
        });
      }
    },
  });
}

export function useCancelCareTask(retryQueue?: MutationRetryQueue) {
  const queryClient = useQueryClient();
  const cancelAndInvalidate = useCallback(
    async (id: string): Promise<CareTask> => {
      const cancelled = await careTasksApi.cancel(id);
      await invalidateCareTaskQueries(queryClient);
      return cancelled;
    },
    [queryClient]
  );
  return useMutation<CareTask, Error, string>({
    mutationFn: cancelAndInvalidate,
    onError: (error, id) => {
      if (retryQueue !== undefined && isNetworkError(error)) {
        retryQueue.enqueue({
          key: `care-task-cancel:${id}`,
          run: () => cancelAndInvalidate(id),
          safeToRetry: true,
        });
      }
    },
  });
}
