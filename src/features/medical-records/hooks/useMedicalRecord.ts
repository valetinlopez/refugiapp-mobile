import { useQuery } from '@tanstack/react-query';

import { medicalRecordsApi } from '../api/medicalRecordsApi';

import { medicalRecordKeys } from './medicalRecordKeys';

export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: medicalRecordKeys.detail(id),
    queryFn: () => medicalRecordsApi.getById(id),
    enabled: id !== '',
    retry: 1,
  });
}
