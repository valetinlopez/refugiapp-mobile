import type { Expense } from '../types';
import { sumExpenseAmountCents } from './expenseTotals';

function expense(amountCents: number, id = 'expense-1'): Expense {
  return {
    id,
    animalId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    category: 'food',
    amountCents,
    currency: 'ARS',
    description: 'Concepto',
    ticketMediaId: null,
    incurredAt: '2026-09-22T12:00:00.000Z',
  };
}

describe('sumExpenseAmountCents', () => {
  it('sums the loaded expenses in integer cents', () => {
    expect(sumExpenseAmountCents([expense(1000), expense(2000, 'expense-2')])).toBe(3000);
  });

  it('returns zero for an empty list without floating point drift', () => {
    expect(sumExpenseAmountCents([])).toBe(0);
  });

  it('never converts to floating point pesos', () => {
    expect(sumExpenseAmountCents([expense(1), expense(2, 'expense-2')])).toBe(3);
  });
});
