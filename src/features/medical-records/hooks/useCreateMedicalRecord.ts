import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { UploadCancelledError } from '@/core/media';

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
  const abortController = useRef<AbortController | null>(null);
  const [upload, setUpload] = useState<{ fileName: string; progress: number } | null>(null);

  const mutation = useMutation<MedicalRecord, CreateMedicalRecordError, CreateMedicalRecordInput>({
    mutationFn: async ({ form, attachments }) => {
      const uploadedIds: string[] = [];
      abortController.current = new AbortController();

      try {
        for (const [index, file] of attachments.entries()) {
          setUpload({ fileName: file.name, progress: index / attachments.length });
          const asset = await clinicalAttachmentsApi.uploadOrphan(file, undefined, {
            signal: abortController.current.signal,
            onUploadProgress: (fileProgress) =>
              setUpload({
                fileName: file.name,
                progress: (index + fileProgress) / attachments.length,
              }),
          });
          uploadedIds.push(asset.id);
        }
      } catch (error) {
        await deleteUploaded(uploadedIds);
        if (abortController.current.signal.aborted) {
          throw new CreateMedicalRecordError('attachment', new UploadCancelledError());
        }
        throw new CreateMedicalRecordError('attachment', error);
      } finally {
        setUpload(null);
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
