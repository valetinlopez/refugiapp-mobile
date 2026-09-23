import { useQuery } from '@tanstack/react-query';

import { expensesApi } from '../api/expensesApi';
import { expenseKeys } from './expenseKeys';

export function useExpenseAnimals() {
  return useQuery({
    queryKey: expenseKeys.animals,
    queryFn: () => expensesApi.listAnimalOptions(),
  });
}
