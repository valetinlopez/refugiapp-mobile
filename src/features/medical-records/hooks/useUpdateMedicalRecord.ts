import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clinicalAttachmentsApi, type AttachmentFile } from '../api/clinicalAttachmentsApi';
import { medicalRecordsApi } from '../api/medicalRecordsApi';
import type { MedicalRecord } from '../types';
import { UpdateMedicalRecordError } from '../utils/medicalRecordErrorMessages';
import type {
  MedicalRecordRecordFields,
  UpdateMedicalRecordFormValues,
} from '../utils/medicalRecordSchema';
import {
  hasPatchChanges,
  toUpdateMedicalRecordRequest,
} from '../utils/toUpdateMedicalRecordRequest';

import { invalidateMedicalRecordQueries } from './invalidateMedicalRecordQueries';
import { medicalRecordKeys } from './medicalRecordKeys';

export interface UpdateMedicalRecordInput {
  id: string;
  initial: MedicalRecordRecordFields;
  form: UpdateMedicalRecordFormValues;
  newAttachments: AttachmentFile[];
  removedAttachmentIds: string[];
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation<MedicalRecord, UpdateMedicalRecordError, UpdateMedicalRecordInput>({
    mutationFn: async ({ id, initial, form, newAttachments, removedAttachmentIds }) => {
      const patch = toUpdateMedicalRecordRequest(initial, form);
      const hasChanges =
        hasPatchChanges(patch) || newAttachments.length > 0 || removedAttachmentIds.length > 0;

      if (!hasChanges) {
        return medicalRecordsApi.getById(id);
      }

      let updated: MedicalRecord | undefined;
      if (hasPatchChanges(patch)) {
        updated = await medicalRecordsApi.update(id, patch).catch((error) => {
          throw new UpdateMedicalRecordError('update', error);
        });
      }

      const uploadedIds: string[] = [];
      try {
        for (const file of newAttachments) {
          const asset = await clinicalAttachmentsApi.uploadToRecord(id, file);
          uploadedIds.push(asset.id);
        }
      } catch (error) {
        await deleteUploaded(uploadedIds);
        throw new UpdateMedicalRecordError('attachment', error);
      }

      await Promise.all(
        removedAttachmentIds.map((mediaId) =>
          clinicalAttachmentsApi.delete(mediaId).catch(() => undefined)
        )
      );

      return updated ?? medicalRecordsApi.getById(id);
    },
    onSuccess: async (record) => {
      void queryClient.setQueryData(medicalRecordKeys.detail(record.id), record);
      await invalidateMedicalRecordQueries(queryClient);
    },
  });
}

async function deleteUploaded(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => clinicalAttachmentsApi.delete(id).catch(() => undefined)));
}
