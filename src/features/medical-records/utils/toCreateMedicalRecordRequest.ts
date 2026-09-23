import type { CreateMedicalRecordRequest } from '../types';

import type { CreateMedicalRecordFormValues } from './medicalRecordSchema';

export function toCreateMedicalRecordRequest(
  values: CreateMedicalRecordFormValues,
  attachmentMediaIds?: string[]
): CreateMedicalRecordRequest {
  return {
    animalId: values.animalId,
    recordType: values.recordType,
    title: values.title,
    occurredAt: values.occurredAt,
    ...(values.veterinarianId !== undefined ? { veterinarianId: values.veterinarianId } : {}),
    ...(values.diagnosis !== undefined ? { diagnosis: values.diagnosis } : {}),
    ...(values.treatment !== undefined ? { treatment: values.treatment } : {}),
    ...(values.notes !== undefined ? { notes: values.notes } : {}),
    ...(attachmentMediaIds !== undefined && attachmentMediaIds.length > 0
      ? { attachmentMediaIds }
      : {}),
  };
}
