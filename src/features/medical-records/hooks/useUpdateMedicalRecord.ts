import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { UploadCancelledError } from '@/core/media';

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
  const abortController = useRef<AbortController | null>(null);
  const [upload, setUpload] = useState<{ fileName: string; progress: number } | null>(null);

  const mutation = useMutation<MedicalRecord, UpdateMedicalRecordError, UpdateMedicalRecordInput>({
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
      abortController.current = new AbortController();
      try {
        for (const [index, file] of newAttachments.entries()) {
          setUpload({ fileName: file.name, progress: index / newAttachments.length });
          const asset = await clinicalAttachmentsApi.uploadToRecord(id, file, undefined, {
            signal: abortController.current.signal,
            onUploadProgress: (fileProgress) =>
              setUpload({
                fileName: file.name,
                progress: (index + fileProgress) / newAttachments.length,
              }),
          });
          uploadedIds.push(asset.id);
        }
      } catch (error) {
        await deleteUploaded(uploadedIds);
        if (abortController.current.signal.aborted) {
          throw new UpdateMedicalRecordError('attachment', new UploadCancelledError());
        }
        throw new UpdateMedicalRecordError('attachment', error);
      } finally {
        setUpload(null);
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
    onSettled: () => {
      abortController.current = null;
      setUpload(null);
    },
  });

  return {
    ...mutation,
    cancelUpload: () => abortController.current?.abort(),
    upload,
  };
}

async function deleteUploaded(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => clinicalAttachmentsApi.delete(id).catch(() => undefined)));
}
