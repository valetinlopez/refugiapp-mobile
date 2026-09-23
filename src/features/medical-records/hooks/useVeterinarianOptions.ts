import { useQuery } from '@tanstack/react-query';

import { veterinarianOptionsApi } from '../api/veterinarianOptionsApi';

import { medicalRecordKeys } from './medicalRecordKeys';

export function useVeterinarianOptions() {
  return useQuery({
    queryKey: medicalRecordKeys.veterinarianOptions,
    queryFn: () => veterinarianOptionsApi.listActive(),
    retry: 1,
  });
}
