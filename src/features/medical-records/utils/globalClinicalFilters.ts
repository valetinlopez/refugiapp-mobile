import { parseDateOnly, toLocalDateTimeIso } from '@/components/patterns';

import type { MedicalRecordType } from '../types';

export type ClinicalDatePreset = 'last7' | 'last30' | 'thisMonth' | 'custom';

export interface ClinicalDateRange {
  from?: string;
  to?: string;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(year)}-${month}-${day}`;
}

function startOfLocalDay(value: string): string | undefined {
  if (!DATE_ONLY_PATTERN.test(value)) return undefined;
  const date = parseDateOnly(value);
  if (Number.isNaN(date.getTime())) return undefined;
  date.setHours(0, 0, 0, 0);
  return toLocalDateTimeIso(date);
}

function endOfLocalDay(value: string): string | undefined {
  if (!DATE_ONLY_PATTERN.test(value)) return undefined;
  const date = parseDateOnly(value);
  if (Number.isNaN(date.getTime())) return undefined;
  date.setHours(23, 59, 59, 999);
  return toLocalDateTimeIso(date);
}

/**
 * Converts a calendar range (`YYYY-MM-DD` from the date picker) into the ISO
 * `date-time` bounds the contract expects, spanning the full local day so the
 * end date is inclusive. Invalid values are dropped instead of sent raw.
 */
export function toClinicalDateFilterIso(range: ClinicalDateRange): ClinicalDateRange {
  const from = range.from === undefined ? undefined : startOfLocalDay(range.from);
  const to = range.to === undefined ? undefined : endOfLocalDay(range.to);
  return {
    ...(from !== undefined ? { from } : {}),
    ...(to !== undefined ? { to } : {}),
  };
}

export function isValidClinicalDateRange(from?: string, to?: string): boolean {
  if (from === undefined || to === undefined) return true;
  if (!DATE_ONLY_PATTERN.test(from) || !DATE_ONLY_PATTERN.test(to)) return false;
  const fromDate = parseDateOnly(from);
  const toDate = parseDateOnly(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return false;
  return fromDate.getTime() <= toDate.getTime();
}

export function getClinicalDatePresetRange(
  preset: Exclude<ClinicalDatePreset, 'custom'>,
  now: Date = new Date()
): Required<ClinicalDateRange> {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (preset === 'thisMonth') {
    return {
      from: toDateOnly(new Date(today.getFullYear(), today.getMonth(), 1)),
      to: toDateOnly(today),
    };
  }

  const days = preset === 'last7' ? 7 : 30;
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  return { from: toDateOnly(start), to: toDateOnly(today) };
}

export function hasActiveGlobalClinicalFilters(
  recordType: MedicalRecordType | undefined,
  range: ClinicalDateRange
): boolean {
  return recordType !== undefined || range.from !== undefined || range.to !== undefined;
}

/**
 * Best-effort client filter for the one dimension the global contract does not
 * support server-side. It only narrows the loaded pages; the screen must tell
 * the user that more loaded pages can still match.
 */
export function filterRecordsByAnimal<T extends { animalId: string }>(
  records: readonly T[],
  animalId: string | undefined
): T[] {
  if (animalId === undefined) return [...records];
  return records.filter((record) => record.animalId === animalId);
}
