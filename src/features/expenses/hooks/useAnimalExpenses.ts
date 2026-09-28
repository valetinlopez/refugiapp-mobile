import { useQuery } from '@tanstack/react-query';

import { expensesApi } from '../api/expensesApi';
import { expenseKeys } from './expenseKeys';

export function useAnimalExpenses(animalId: string) {
  return useQuery({
    queryKey: expenseKeys.listByAnimal(animalId),
    queryFn: () => expensesApi.listByAnimal(animalId),
    enabled: animalId !== '',
    retry: 1,
  });
}
