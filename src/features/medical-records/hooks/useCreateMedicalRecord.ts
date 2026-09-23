import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clinicalAttachmentsApi, type AttachmentFile } from '../api/clinicalAttachmentsApi';
import { medicalRecordsApi } from '../api/medicalRecordsApi';
import type { MedicalRecord } from '../types';
import { CreateMedicalRecordError } from '../utils/medicalRecordErrorMessages';
import type { CreateMedicalRecordFormValues } from '../utils/medicalRecordSchema';
import { toCreateMedicalRecordRequest } from '../utils/toCreateMedicalRecordRequest';

import { invalidateMedicalRecordQueries } from './invalidateMedicalRecordQueries';

export interface CreateMedicalRecordInput {
  form: CreateMedicalRecordFormValues;
  attachments: AttachmentFile[];
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation<MedicalRecord, CreateMedicalRecordError, CreateMedicalRecordInput>({
    mutationFn: async ({ form, attachments }) => {
      const uploadedIds: string[] = [];

      try {
        for (const file of attachments) {
          const asset = await clinicalAttachmentsApi.uploadOrphan(file);
          uploadedIds.push(asset.id);
        }
      } catch (error) {
        await deleteUploaded(uploadedIds);
        throw new CreateMedicalRecordError('attachment', error);
      }

      try {
        return await medicalRecordsApi.create(
          toCreateMedicalRecordRequest(form, uploadedIds.length > 0 ? uploadedIds : undefined)
        );
      } catch (error) {
        await deleteUploaded(uploadedIds);
        throw new CreateMedicalRecordError('create', error);
      }
    },
    onSuccess: async () => {
      await invalidateMedicalRecordQueries(queryClient);
    },
  });
}

async function deleteUploaded(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => clinicalAttachmentsApi.delete(id).catch(() => undefined)));
}
