import {
  intakeStartOfDay,
  intakeStartOfDayMs,
  OCCURRED_AT_FUTURE_TOLERANCE_MS,
} from './occurredAtWindow';

describe('occurredAtWindow', () => {
  it('returns the local midnight of a valid intake date', () => {
    expect(intakeStartOfDayMs('2026-01-10')).toBe(new Date(2026, 0, 10, 0, 0, 0, 0).getTime());
  });

  it('returns null for malformed or invalid intake dates', () => {
    expect(intakeStartOfDayMs('2026-13-40')).toBeNull();
    expect(intakeStartOfDayMs('not-a-date')).toBeNull();
    expect(intakeStartOfDayMs('2026-01-10T00:00:00')).toBeNull();
  });

  it('builds a local Date from the intake start', () => {
    expect(intakeStartOfDay('2026-01-10')).toEqual(new Date(2026, 0, 10, 0, 0, 0, 0));
    expect(intakeStartOfDay('bad')).toBeNull();
  });

  it('defines the future skew tolerance as 60 seconds', () => {
    expect(OCCURRED_AT_FUTURE_TOLERANCE_MS).toBe(60_000);
  });
});
