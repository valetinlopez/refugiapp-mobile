import type { ExpenseFilters } from '../types';

export type ExpenseDatePreset = 'last7' | 'last30' | 'thisMonth' | 'custom';

export interface ExpenseDateRange {
  from?: string;
  to?: string;
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (match === null) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(year)}-${month}-${day}`;
}

function startOfLocalDay(value: string): string | undefined {
  const date = parseDateOnly(value);
  if (date === null) return undefined;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).toISOString();
}

function endOfLocalDay(value: string): string | undefined {
  const date = parseDateOnly(value);
  if (date === null) return undefined;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  ).toISOString();
}

/**
 * Converts a calendar range (`YYYY-MM-DD` from the date picker) into the ISO
 * `date-time` bounds the contract expects, spanning the full local day so the
 * end date is inclusive. Invalid values are dropped instead of sent raw.
 */
export function toExpenseDateFilterIso(range: ExpenseDateRange): ExpenseDateRange {
  const from = range.from === undefined ? undefined : startOfLocalDay(range.from);
  const to = range.to === undefined ? undefined : endOfLocalDay(range.to);
  return {
    ...(from !== undefined ? { from } : {}),
    ...(to !== undefined ? { to } : {}),
  };
}

export function isValidExpenseDateRange(from?: string, to?: string): boolean {
  if (from === undefined || to === undefined) return true;
  const fromDate = parseDateOnly(from);
  const toDate = parseDateOnly(to);
  if (fromDate === null || toDate === null) return false;
  return fromDate.getTime() <= toDate.getTime();
}

export function getExpenseDatePresetRange(
  preset: Exclude<ExpenseDatePreset, 'custom'>,
  now: Date = new Date()
): Required<ExpenseDateRange> {
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

export function hasActiveExpenseFilters(filters: ExpenseFilters): boolean {
  return (
    filters.animalId !== undefined ||
    filters.category !== undefined ||
    filters.from !== undefined ||
    filters.to !== undefined
  );
}
