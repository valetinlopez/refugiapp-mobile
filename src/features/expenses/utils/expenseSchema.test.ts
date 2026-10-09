import { expenseSchema } from './expenseSchema';
import { toCreateExpenseRequest } from './toCreateExpenseRequest';

const valid = {
  animalId: '9aa98390-2695-4d5b-86e8-e043410a7fe8',
  category: 'food' as const,
  description: 'Alimento',
  amountUnits: '48.500,00',
  incurredAt: '2026-09-23T10:30:00-03:00',
};

describe('expenseSchema', () => {
  it.each(['0', '1', '48.500,00', '48500', '48500,50', '48500.50'])(
    'accepts valid amount units %s',
    (amountUnits) => {
      expect(expenseSchema.safeParse({ ...valid, amountUnits }).success).toBe(true);
    }
  );

  it.each(['-1', '1.500,123', 'abc', '', '1,2,3'])('rejects invalid amount %j', (amountUnits) => {
    expect(expenseSchema.safeParse({ ...valid, amountUnits }).success).toBe(false);
  });

  it('accepts a datetime-local incurredAt with offset', () => {
    expect(expenseSchema.safeParse(valid).success).toBe(true);
  });

  it.each(['', '2026-09-23', '23-09-2026', 'no es una fecha'])(
    'rejects invalid incurredAt %j',
    (incurredAt) => {
      expect(expenseSchema.safeParse({ ...valid, incurredAt }).success).toBe(false);
    }
  );

  it('rejects a description longer than the UI limit', () => {
    expect(expenseSchema.safeParse({ ...valid, description: 'x'.repeat(1001) }).success).toBe(
      false
    );
    expect(expenseSchema.safeParse({ ...valid, description: 'x'.repeat(1000) }).success).toBe(true);
  });

  it('requires an animal and a category', () => {
    expect(expenseSchema.safeParse({ ...valid, animalId: '' }).success).toBe(false);
    expect(expenseSchema.safeParse({ ...valid, animalId: 'not-a-uuid' }).success).toBe(false);
    expect(expenseSchema.safeParse({ ...valid, category: undefined }).success).toBe(false);
  });
});

describe('toCreateExpenseRequest', () => {
  it('converts ARS units to integer cents and sends ARS currency', () => {
    const request = toCreateExpenseRequest(valid);
    expect(request.amountCents).toBe(4_850_000);
    expect(request.currency).toBe('ARS');
    expect(request).not.toHaveProperty('ticketMediaId');
  });

  it('omits ticketMediaId when the receipt was not uploaded', () => {
    expect(toCreateExpenseRequest(valid)).not.toHaveProperty('ticketMediaId');
  });

  it('includes ticketMediaId when the receipt was uploaded', () => {
    expect(toCreateExpenseRequest(valid, 'media-id').ticketMediaId).toBe('media-id');
  });

  it('serializes the local datetime to ISO', () => {
    const request = toCreateExpenseRequest(valid);
    expect(request.incurredAt).toBe(new Date('2026-09-23T10:30:00-03:00').toISOString());
  });
});
