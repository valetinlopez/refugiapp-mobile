import { useAnimalOption } from '@/application/animals';

export function useCareTaskAnimal(animalId: string | undefined) {
  return useAnimalOption(animalId, animalId !== undefined);
}
