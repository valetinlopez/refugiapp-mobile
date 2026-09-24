import { formatDateMedium, formatDateShort, formatDateTime, parseDateOnly } from './dateFormat';

describe('parseDateOnly', () => {
  it('parses YYYY-MM-DD as a local date at noon to avoid timezone shifts', () => {
    const date = parseDateOnly('2026-01-10');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(10);
  });

  it('returns an invalid date for malformed input', () => {
    expect(Number.isNaN(parseDateOnly('10/01/2026').getTime())).toBe(true);
    expect(Number.isNaN(parseDateOnly('').getTime())).toBe(true);
  });
});

describe('formatDateShort', () => {
  it('formats a date-only value for the es-AR locale', () => {
    expect(formatDateShort('2026-01-10')).toBe(
      new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' }).format(new Date(2026, 0, 10, 12))
    );
  });

  it('returns an empty string for invalid input', () => {
    expect(formatDateShort('not-a-date')).toBe('');
  });
});

describe('formatDateMedium', () => {
  it('formats a date-only value with a longer es-AR style', () => {
    expect(formatDateMedium('2026-01-10')).toBe(
      new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(2026, 0, 10, 12))
    );
  });

  it('returns an empty string for invalid input', () => {
    expect(formatDateMedium('')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('formats an ISO datetime for the es-AR locale', () => {
    expect(formatDateTime('2026-09-21T14:30:00.000Z')).toBe(
      new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date('2026-09-21T14:30:00.000Z')
      )
    );
  });

  it('returns an empty string for invalid input', () => {
    expect(formatDateTime('')).toBe('');
    expect(formatDateTime('nope')).toBe('');
  });
});
