import { formatArsUnitsPreview, parseArsUnitsToCents } from './expenseAmount';

describe('parseArsUnitsToCents', () => {
  it.each([
    ['0', 0],
    ['1', 100],
    ['48.500', 4_850_000],
    ['48.500,00', 4_850_000],
    ['48.500,5', 4_850_050],
    ['48500', 4_850_000],
    ['48500,50', 4_850_050],
    ['48500.50', 4_850_050],
    ['1234', 123_400],
    ['0,05', 5],
    ['12,34', 1_234],
    [' 12.345,67 ', 1_234_567],
  ])('parses %s to %i cents', (input, expected) => {
    expect(parseArsUnitsToCents(input)).toBe(expected);
  });

  it.each(['', '  ', 'abc', '-1', '1.234,567', '48.50,00', '1,2,3', '1.2.3', '.', ','])(
    'rejects invalid input %j',
    (input) => {
      expect(parseArsUnitsToCents(input)).toBeNull();
    }
  );

  it('returns null when cents overflow the safe integer range', () => {
    expect(parseArsUnitsToCents('90071992547409,92')).toBeNull();
    expect(parseArsUnitsToCents('90071992547409,91')).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('never produces a fractional cent', () => {
    const cents = parseArsUnitsToCents('48.500,00');
    expect(cents).not.toBeNull();
    expect(Number.isInteger(cents)).toBe(true);
  });
});

describe('formatArsUnitsPreview', () => {
  it('formats valid units as ARS currency', () => {
    expect(formatArsUnitsPreview('48.500,00')).toContain('48.500,00');
  });

  it('returns null while the text is not a valid amount', () => {
    expect(formatArsUnitsPreview('abc')).toBeNull();
    expect(formatArsUnitsPreview('')).toBeNull();
  });
});
