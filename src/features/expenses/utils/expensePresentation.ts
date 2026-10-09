import { formatDateMedium } from '@/components/patterns';

import type { ExpenseCategory } from '../types';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Alimentación',
  medicine: 'Medicamentos',
  veterinary: 'Veterinaria',
  supplies: 'Insumos',
  transport: 'Transporte',
  other: 'Otro',
};

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

export function formatAmountCents(amountCents: number): string {
  return currencyFormatter.format(amountCents / 100);
}

export function getExpenseCategoryLabel(category: ExpenseCategory): string {
  return CATEGORY_LABELS[category];
}

export function formatExpenseDate(value: string): string {
  return formatDateMedium(value);
}

/**
 * Resolves the "registered by" value best-effort from session data.
 *
 * `ExpenseResponseDto` only exposes `createdByUserId` (UUID), with no readable
 * name and no user lookup available to every role, so a raw UUID is never
 * rendered. When the expense belongs to the current user we can say "Vos";
 * otherwise the row is omitted (`null`) instead of inventing or leaking an id.
 */
export function getRegisteredByLabel(
  createdByUserId: string | null,
  currentUserId: string | null | undefined
): string | null {
  if (createdByUserId === null) return null;
  if (currentUserId != null && createdByUserId === currentUserId) return 'Vos';
  return null;
}
