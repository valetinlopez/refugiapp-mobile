import { formatDateTime } from '@/components/patterns';

import type { MedicalRecordType } from '../types';

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

export function formatRecordDate(value: string): string {
  return formatDateTime(value);
}
