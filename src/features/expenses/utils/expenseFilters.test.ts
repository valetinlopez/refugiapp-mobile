import {
  getExpenseDatePresetRange,
  hasActiveExpenseFilters,
  isValidExpenseDateRange,
  toExpenseDateFilterIso,
} from './expenseFilters';

describe('toExpenseDateFilterIso', () => {
  it('spans the full local day so the end date is inclusive', () => {
    const result = toExpenseDateFilterIso({ from: '2026-09-22', to: '2026-09-22' });

    expect(result.from).toBe(new Date(2026, 8, 22, 0, 0, 0, 0).toISOString());
    expect(result.to).toBe(new Date(2026, 8, 22, 23, 59, 59, 999).toISOString());
  });

  it('drops invalid calendar values instead of sending them raw', () => {
    expect(toExpenseDateFilterIso({ from: 'not-a-date' })).toEqual({});
  });

  it('keeps only the provided bounds', () => {
    const result = toExpenseDateFilterIso({ from: '2026-09-01' });
    expect(result.from).toBe(new Date(2026, 8, 1, 0, 0, 0, 0).toISOString());
    expect(result.to).toBeUndefined();
  });
});

describe('isValidExpenseDateRange', () => {
  it('accepts an empty or single-sided range', () => {
    expect(isValidExpenseDateRange(undefined, undefined)).toBe(true);
    expect(isValidExpenseDateRange('2026-09-22', undefined)).toBe(true);
  });

  it('rejects a range whose start is after its end', () => {
    expect(isValidExpenseDateRange('2026-09-22', '2026-09-01')).toBe(false);
    expect(isValidExpenseDateRange('2026-09-01', '2026-09-22')).toBe(true);
  });
});

describe('getExpenseDatePresetRange', () => {
  const now = new Date(2026, 8, 22, 15, 30);

  it('computes the last seven and thirty day windows', () => {
    expect(getExpenseDatePresetRange('last7', now)).toEqual({
      from: '2026-09-16',
      to: '2026-09-22',
    });
    expect(getExpenseDatePresetRange('last30', now)).toEqual({
      from: '2026-08-24',
      to: '2026-09-22',
    });
  });

  it('computes the current month window', () => {
    expect(getExpenseDatePresetRange('thisMonth', now)).toEqual({
      from: '2026-09-01',
      to: '2026-09-22',
    });
  });
});

describe('hasActiveExpenseFilters', () => {
  it('detects no filters versus any active filter', () => {
    expect(hasActiveExpenseFilters({})).toBe(false);
    expect(hasActiveExpenseFilters({ animalId: 'a' })).toBe(true);
    expect(hasActiveExpenseFilters({ category: 'food' })).toBe(true);
    expect(hasActiveExpenseFilters({ from: '2026-09-01' })).toBe(true);
    expect(hasActiveExpenseFilters({ to: '2026-09-30' })).toBe(true);
  });
});
