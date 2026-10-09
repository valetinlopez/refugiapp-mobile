import { parseArsUnitsToCents } from './expenseAmount';
import type { CreateExpenseRequest } from '../types';
import type { ExpenseFormValues } from './expenseSchema';

/**
 * Maps validated form values to the create payload. `amountUnits` was already
 * validated against `expenseSchema`, so the conversion to integer cents is
 * guaranteed non-null; `ticketMediaId` is only sent when a receipt was uploaded,
 * keeping the receipt genuinely optional (D23 / RFG-156).
 */
export function toCreateExpenseRequest(
  values: ExpenseFormValues,
  ticketMediaId?: string
): CreateExpenseRequest {
  const amountCents = parseArsUnitsToCents(values.amountUnits) ?? 0;
  return {
    animalId: values.animalId,
    category: values.category,
    amountCents,
    currency: 'ARS',
    description: values.description.trim(),
    incurredAt: new Date(values.incurredAt).toISOString(),
    ...(ticketMediaId ? { ticketMediaId } : {}),
  };
}
