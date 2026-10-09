import { useQuery } from '@tanstack/react-query';

import { isUuid } from '@/core/validation';

import { animalIntakeApi } from '../api/animalIntakeApi';

import { medicalRecordKeys } from './medicalRecordKeys';

/**
 * Deferred resolution of the selected animal's `intakeDate`.
 *
 * Only runs for a valid UUID selection; the global create form uses it to bind
 * the `occurredAt` window (local start of the intake day ≤ occurredAt ≤ now+60s)
 * without a request per rendered animal. `data` is `null` while unselected or
 * when the backend value is not a calendar date.
 */
export function useAnimalIntake(animalId: string) {
  const enabled = isUuid(animalId);
  return useQuery({
    queryKey: medicalRecordKeys.animalIntake(animalId),
    queryFn: () => animalIntakeApi.getIntakeDate(animalId),
    enabled,
    retry: 1,
    staleTime: 60_000,
  });
}
