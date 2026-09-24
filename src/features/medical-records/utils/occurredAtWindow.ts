const INTAKE_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const OCCURRED_AT_FUTURE_TOLERANCE_MS = 60_000;

export function intakeStartOfDayMs(intakeDate: string): number | null {
  const match = INTAKE_DATE_PATTERN.exec(intakeDate);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day) {
    return null;
  }
  return start.getTime();
}

export function intakeStartOfDay(intakeDate: string): Date | null {
  const startMs = intakeStartOfDayMs(intakeDate);
  return startMs === null ? null : new Date(startMs);
}
