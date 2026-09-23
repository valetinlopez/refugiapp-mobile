import type { CreateExpenseRequest } from '../types';
import type { ExpenseFormValues } from './expenseSchema';

export function toCreateExpenseRequest(
  values: ExpenseFormValues,
  ticketMediaId?: string
): CreateExpenseRequest {
  return {
    animalId: values.animalId,
    category: values.category,
    amountCents: Number(values.amountCents),
    currency: 'ARS',
    description: values.description.trim(),
    incurredAt: new Date(`${values.incurredAt}T12:00:00`).toISOString(),
    ...(ticketMediaId ? { ticketMediaId } : {}),
  };
}
