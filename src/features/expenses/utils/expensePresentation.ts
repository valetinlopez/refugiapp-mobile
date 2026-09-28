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
