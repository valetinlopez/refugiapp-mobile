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

export function toLocalDateTimeIso(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const offsetMinutes = -date.getTimezoneOffset();
  const offsetSign = offsetMinutes >= 0 ? '+' : '-';
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
  const offsetMins = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:00${offsetSign}${offsetHours}:${offsetMins}`;
}
