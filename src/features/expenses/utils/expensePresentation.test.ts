import { formatAmountCents, formatExpenseDate } from './expensePresentation';

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

describe('formatExpenseDate', () => {
  it('formats the backend ISO datetime without rendering a raw value', () => {
    const value = '2026-09-22T14:30:00.000Z';
    expect(formatExpenseDate(value)).toBe(
      new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(value))
    );
  });
});
