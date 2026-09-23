import type { UpdateMedicalRecordRequest } from '../types';

import type {
  MedicalRecordRecordFields,
  UpdateMedicalRecordFormValues,
} from './medicalRecordSchema';

function isUnchanged(initial: string | null, current: string | undefined): boolean {
  return current === undefined ? initial === null : current === initial;
}

function toPatchText(
  initial: string | null,
  current: string | undefined
): { value: string | null; changed: boolean } {
  if (isUnchanged(initial, current)) {
    return { changed: false, value: initial };
  }
  return { changed: true, value: current === undefined ? null : current };
}

export function toUpdateMedicalRecordRequest(
  initial: MedicalRecordRecordFields,
  values: UpdateMedicalRecordFormValues
): UpdateMedicalRecordRequest {
  const patch: UpdateMedicalRecordRequest = {};

  if (values.recordType !== initial.recordType) {
    patch.recordType = values.recordType;
  }
  if (values.title !== initial.title) {
    patch.title = values.title;
  }
  if (values.occurredAt !== initial.occurredAt) {
    patch.occurredAt = values.occurredAt;
  }

  const vet = toPatchText(initial.veterinarianId, values.veterinarianId);
  if (vet.changed) {
    patch.veterinarianId = vet.value;
  }

  const diagnosis = toPatchText(initial.diagnosis, values.diagnosis);
  if (diagnosis.changed) {
    patch.diagnosis = diagnosis.value;
  }

  const treatment = toPatchText(initial.treatment, values.treatment);
  if (treatment.changed) {
    patch.treatment = treatment.value;
  }

  const notes = toPatchText(initial.notes, values.notes);
  if (notes.changed) {
    patch.notes = notes.value;
  }

  return patch;
}

export function hasPatchChanges(patch: UpdateMedicalRecordRequest): boolean {
  return Object.keys(patch).length > 0;
}
