import { useAnimalOption } from '@/application/animals';

export function useExpenseAnimal(animalId: string | undefined) {
  return useAnimalOption(animalId, animalId !== undefined);
}
