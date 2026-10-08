import type { Expense } from '../types';

/**
 * Sums the `amountCents` of the expenses actually loaded in memory.
 *
 * The backend does not expose a global monetary total, so this is explicitly a
 * running subtotal over the loaded pages and must never be labelled as a global
 * total. Money stays integer (cents) end to end: no floating point arithmetic.
 */
export function sumExpenseAmountCents(expenses: readonly Expense[]): number {
  return expenses.reduce((total, expense) => total + expense.amountCents, 0);
}
