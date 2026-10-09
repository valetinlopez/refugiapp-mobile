import { useAnimalOptionsWithFallback } from '@/application/animals';

/**
 * Minimal animal options for the global clinical create form.
 *
 * Delegates to the shared `application/animals` boundary (first page of 100,
 * client-side alphabetical order, `GET /animals/:id` fallback for a preset
 * `animalId`), the same contract used by `care-tasks` and `expenses`.
 */
export function useMedicalRecordAnimals(animalId?: string) {
  return useAnimalOptionsWithFallback(animalId);
}
