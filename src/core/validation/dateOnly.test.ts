import { toDateOnly } from './dateOnly';

describe('toDateOnly', () => {
  it('keeps a date-only value untouched', () => {
    expect(toDateOnly('2026-01-10')).toBe('2026-01-10');
  });

  it('trims an ISO datetime to its date part', () => {
    expect(toDateOnly('2026-01-10T00:00:00.000Z')).toBe('2026-01-10');
    expect(toDateOnly('2026-01-10T23:59:59.000-03:00')).toBe('2026-01-10');
  });

  it('trims surrounding whitespace', () => {
    expect(toDateOnly(' 2026-01-10 ')).toBe('2026-01-10');
  });

  it('returns null for nullish or empty values', () => {
    expect(toDateOnly(null)).toBeNull();
    expect(toDateOnly(undefined)).toBeNull();
    expect(toDateOnly('')).toBeNull();
    expect(toDateOnly('   ')).toBeNull();
  });

  it('returns null for malformed or impossible dates', () => {
    expect(toDateOnly('not-a-date')).toBeNull();
    expect(toDateOnly('10/01/2026')).toBeNull();
    expect(toDateOnly('2026-13-45')).toBeNull();
    expect(toDateOnly('2026-02-30')).toBeNull();
  });
});
