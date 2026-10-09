import { formatAmountCents } from './expensePresentation';

/**
 * Parses an ARS amount typed in units (pesos) into integer cents, avoiding any
 * floating point arithmetic so the conversion is exact (D23 / RFG-156).
 *
 * Accepted formats, matching es-AR keyboards as well as plain digits:
 *  - grouped thousands with a dot and optional comma decimals: `48.500,00`
 *  - plain digits with optional comma decimals: `48500,50`
 *  - plain digits with optional dot decimals: `48500.50`
 *
 * A lone dot with groups of three digits (`48.500`) is treated as thousands
 * grouping (es-AR), never as a decimal separator. Returns `null` when the input
 * is empty, invalid or its cents exceed the safe integer range.
 */
export function parseArsUnitsToCents(input: string): number | null {
  const value = input.trim().replace(/\s+/g, '');
  if (value === '') return null;

  const grouped = /^(\d{1,3}(?:\.\d{3})+)(?:,(\d{1,2}))?$/.exec(value);
  const commaDecimal = /^(\d+)(?:,(\d{1,2}))?$/.exec(value);
  const dotDecimal = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);

  const match = grouped ?? commaDecimal ?? dotDecimal;
  if (match === null) return null;

  const intRaw = (match[1] ?? '').replace(/\./g, '');
  const decRaw = match[2] ?? '';

  const units = BigInt(intRaw === '' ? '0' : intRaw);
  const cents = BigInt((decRaw + '00').slice(0, 2));
  const totalCents = units * 100n + cents;

  if (totalCents > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return Number(totalCents);
}

/**
 * Formats a valid ARS-units string as the ARS currency preview shown next to
 * the input (e.g. `48.500,00` -> `$ 48.500,00`). Returns `null` while the text
 * does not parse so callers can hide the preview instead of showing a stale one.
 */
export function formatArsUnitsPreview(input: string): string | null {
  const cents = parseArsUnitsToCents(input);
  return cents === null ? null : formatAmountCents(cents);
}
