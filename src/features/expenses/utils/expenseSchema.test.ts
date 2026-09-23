import { expenseSchema } from './expenseSchema';

const valid = {
  animalId: '9aa98390-2695-4d5b-86e8-e043410a7fe8',
  category: 'food' as const,
  description: 'Alimento',
  amountCents: '1250',
  incurredAt: '2026-09-23',
};

describe('expenseSchema', () => {
  it.each(['0', '1', '1250'])('accepts non-negative integer amount %s', (amountCents) => {
    expect(expenseSchema.safeParse({ ...valid, amountCents }).success).toBe(true);
  });

  it.each(['-1', '1.5', 'abc', ''])('rejects invalid amount %s', (amountCents) => {
    expect(expenseSchema.safeParse({ ...valid, amountCents }).success).toBe(false);
  });
});
