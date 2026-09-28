import { useAnimalOptionsWithFallback } from '@/application/animals';

export function useExpenseAnimals(animalId?: string) {
  return useAnimalOptionsWithFallback(animalId);
}
