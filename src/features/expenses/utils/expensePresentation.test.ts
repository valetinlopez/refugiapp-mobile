import { formatAmountCents } from './expensePresentation';

describe('formatAmountCents', () => {
  it('formats integer cents as Argentine pesos', () => {
    const value = formatAmountCents(123456);
    expect(value).toContain('1.234,56');
    expect(value).toMatch(/\$|ARS/);
  });

  it('keeps zero without floating point arithmetic', () => {
    expect(formatAmountCents(0)).toMatch(/0,00/);
  });
});
