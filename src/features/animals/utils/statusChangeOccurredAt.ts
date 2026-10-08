/**
 * Pure validation for the optional `occurredAt` of a status change.
 *
 * The backend exposes `ChangeAnimalStatusDto.occurredAt` and records the
 * current time when it is omitted. The future date cannot exceed a 60 second
 * clock-skew tolerance (same product rule as general events and clinical
 * records; see ADR-0007).
 */
export const STATUS_CHANGE_FUTURE_TOLERANCE_MS = 60_000;

export function isValidStatusChangeOccurredAt(value: string, now: number = Date.now()): boolean {
  if (value === '') {
    return true;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? false : parsed <= now + STATUS_CHANGE_FUTURE_TOLERANCE_MS;
}
