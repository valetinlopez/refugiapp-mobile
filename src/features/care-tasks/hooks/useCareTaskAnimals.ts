import { useAnimalOptionsWithFallback } from '@/application/animals';

export function useCareTaskAnimals(animalId?: string) {
  return useAnimalOptionsWithFallback(animalId);
}
