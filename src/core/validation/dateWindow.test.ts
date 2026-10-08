import { localDayStart, localDayStartMs, OCCURRED_AT_FUTURE_TOLERANCE_MS } from './dateWindow';

describe('dateWindow', () => {
  it('computes the local start of day for a calendar date', () => {
    expect(localDayStartMs('2026-01-10')).toBe(new Date(2026, 0, 10, 0, 0, 0, 0).getTime());
  });

  it('rejects malformed or impossible calendar dates', () => {
    expect(localDayStartMs('2026-13-40')).toBeNull();
    expect(localDayStartMs('not-a-date')).toBeNull();
    expect(localDayStartMs('2026-01-10T00:00:00')).toBeNull();
  });

  it('returns a Date instance or null', () => {
    expect(localDayStart('2026-01-10')).toEqual(new Date(2026, 0, 10, 0, 0, 0, 0));
    expect(localDayStart('bad')).toBeNull();
  });

  it('keeps the future skew tolerance at 60 seconds', () => {
    expect(OCCURRED_AT_FUTURE_TOLERANCE_MS).toBe(60_000);
  });
});
