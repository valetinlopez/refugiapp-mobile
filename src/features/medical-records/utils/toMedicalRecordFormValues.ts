import type { MedicalRecord } from '../types';

import type {
  MedicalRecordRecordFields,
  UpdateMedicalRecordFormInput,
} from './medicalRecordSchema';

export function toMedicalRecordRecordFields(record: MedicalRecord): MedicalRecordRecordFields {
  return {
    recordType: record.recordType,
    title: record.title,
    occurredAt: record.occurredAt,
    veterinarianId: record.veterinarianId,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    notes: record.notes,
  };
}

export function toUpdateMedicalRecordFormValues(
  record: MedicalRecord
): UpdateMedicalRecordFormInput {
  return {
    recordType: record.recordType,
    title: record.title,
    occurredAt: record.occurredAt,
    veterinarianId: record.veterinarianId ?? '',
    diagnosis: record.diagnosis ?? '',
    treatment: record.treatment ?? '',
    notes: record.notes ?? '',
  };
}
