import { useQuery } from '@tanstack/react-query';

import { veterinarianOptionsApi } from '../api/veterinarianOptionsApi';
import type { VeterinariansStatus } from '../types';

import { medicalRecordKeys } from './medicalRecordKeys';

export function useVeterinarianOptions() {
  const query = useQuery({
    queryKey: medicalRecordKeys.veterinarianOptions,
    queryFn: () => veterinarianOptionsApi.listActive(),
    retry: 1,
  });

  const veterinariansStatus: VeterinariansStatus = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : (query.data?.length ?? 0) === 0
        ? 'empty'
        : 'ready';

  return { ...query, veterinariansStatus };
}
