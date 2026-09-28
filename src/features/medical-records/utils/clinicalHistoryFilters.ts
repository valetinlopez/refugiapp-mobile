import { parseDateOnly, toLocalDateTimeIso } from '@/components/patterns';

import type { MedicalRecordFilters, MedicalRecordType } from '../types';

export type ClinicalRangeMode = 'all' | 'custom' | 30 | 90;

export interface ClinicalHistoryFilterInput {
  from: string;
  range: ClinicalRangeMode;
  recordType?: MedicalRecordType;
  to: string;
}

export function getCustomRangeError(from: string, to: string): string | null {
  if (from === '' || to === '') {
    return 'Definí las dos fechas del período.';
  }
  if (parseDateOnly(from).getTime() > parseDateOnly(to).getTime()) {
    return 'La fecha desde no puede ser posterior a la fecha hasta.';
  }
  return null;
}

export function buildClinicalHistoryFilters(
  input: ClinicalHistoryFilterInput
): MedicalRecordFilters {
  const { from, range, recordType, to } = input;
  const typeFilter: MedicalRecordFilters = recordType === undefined ? {} : { recordType };

  if (range === 'all') {
    return typeFilter;
  }
  if (range === 30 || range === 90) {
    const now = new Date();
    const fromDate = new Date(now.getTime());
    fromDate.setDate(fromDate.getDate() - range);
    return { ...typeFilter, from: fromDate.toISOString(), to: now.toISOString() };
  }
  if (getCustomRangeError(from, to) !== null) {
    return typeFilter;
  }
  return { ...typeFilter, from: startOfDayIso(from), to: endOfDayIso(to) };
}

function startOfDayIso(value: string): string {
  const date = parseDateOnly(value);
  date.setHours(0, 0, 0, 0);
  return toLocalDateTimeIso(date);
}

function endOfDayIso(value: string): string {
  const date = parseDateOnly(value);
  date.setHours(23, 59, 0, 0);
  return toLocalDateTimeIso(date);
}
