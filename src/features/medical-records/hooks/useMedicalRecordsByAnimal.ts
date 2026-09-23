import { useQuery } from '@tanstack/react-query';

import { medicalRecordsApi } from '../api/medicalRecordsApi';
import type { MedicalRecordFilters } from '../types';

import { medicalRecordKeys } from './medicalRecordKeys';

export function useMedicalRecordsByAnimal(animalId: string, filters: MedicalRecordFilters = {}) {
  return useQuery({
    queryKey: medicalRecordKeys.listByAnimal(animalId, filters),
    queryFn: () => medicalRecordsApi.listByAnimal(animalId, filters),
    enabled: animalId !== '',
    retry: 1,
  });
}
