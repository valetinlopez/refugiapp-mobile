import { useQuery } from '@tanstack/react-query';

import { expensesApi } from '../api/expensesApi';
import { expenseKeys } from './expenseKeys';

export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expensesApi.getById(id),
    enabled: id !== '',
    retry: 1,
  });
}
