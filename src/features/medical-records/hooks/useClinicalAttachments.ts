import { useQuery } from '@tanstack/react-query';

import { clinicalAttachmentsApi } from '../api/clinicalAttachmentsApi';

import { medicalRecordKeys } from './medicalRecordKeys';

export function useClinicalAttachments(recordId: string, enabled = true) {
  return useQuery({
    queryKey: medicalRecordKeys.attachments(recordId),
    queryFn: () => clinicalAttachmentsApi.listByRecord(recordId),
    enabled: enabled && recordId !== '',
    retry: 1,
  });
}
