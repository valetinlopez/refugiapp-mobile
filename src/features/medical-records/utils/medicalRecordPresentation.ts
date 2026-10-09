import { formatDateTime } from '@/components/patterns';

import type { MedicalRecordType } from '../types';
import { MEDICAL_RECORD_TYPE_VALUES } from './medicalRecordSchema';

const RECORD_TYPE_LABELS: Record<MedicalRecordType, string> = {
  consultation: 'Consulta',
  vaccination: 'Vacunación',
  deworming: 'Desparasitación',
  surgery: 'Cirugía',
  lab_result: 'Resultado de laboratorio',
  treatment: 'Tratamiento',
  other: 'Otro',
};

export function getRecordTypeLabel(type: MedicalRecordType): string {
  return RECORD_TYPE_LABELS[type];
}

/** Ordered labels for the seven contract `recordType` values. */
export const RECORD_TYPE_OPTIONS: { label: string; value: MedicalRecordType }[] =
  MEDICAL_RECORD_TYPE_VALUES.map((value) => ({
    label: getRecordTypeLabel(value),
    value,
  }));

export function formatRecordDate(value: string): string {
  return formatDateTime(value);
}
