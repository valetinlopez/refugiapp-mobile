import { useMutation, useQueryClient } from '@tanstack/react-query';

import { expensesApi } from '../api/expensesApi';
import { dashboardQueryKey, expenseKeys } from './expenseKeys';

/**
 * Soft-deletes an expense (`DELETE /expenses/:id`, `204`).
 *
 * Not optimistic: the backend is the source of truth, so on success all
 * expense queries (lists and detail) and the dashboard are invalidated by
 * prefix. No automatic retries: the action is user-initiated and destructive.
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => expensesApi.remove(id),
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: expenseKeys.detail(id) });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKey }),
      ]);
    },
    retry: 0,
  });
}
