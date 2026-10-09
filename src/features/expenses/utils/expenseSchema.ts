import { z } from 'zod';

import { parseArsUnitsToCents } from './expenseAmount';

export const expenseCategories = [
  'food',
  'medicine',
  'veterinary',
  'supplies',
  'transport',
  'other',
] as const;

export const EXPENSE_DESCRIPTION_MAX_LENGTH = 1000;

function isValidDatetimeLocal(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*/.test(value) && !Number.isNaN(Date.parse(value));
}

export const expenseSchema = z.object({
  animalId: z.string().uuid('Seleccioná un animal.'),
  category: z.enum(expenseCategories, { required_error: 'Seleccioná una categoría.' }),
  description: z
    .string()
    .trim()
    .min(1, 'Ingresá el concepto del gasto.')
    .max(
      EXPENSE_DESCRIPTION_MAX_LENGTH,
      `El concepto no puede superar los ${EXPENSE_DESCRIPTION_MAX_LENGTH} caracteres.`
    ),
  amountUnits: z
    .string()
    .trim()
    .min(1, 'Ingresá el importe en pesos.')
    .refine(
      (value) => parseArsUnitsToCents(value) !== null,
      'Ingresá un importe válido, por ejemplo 48.500,00.'
    ),
  incurredAt: z
    .string()
    .trim()
    .min(1, 'Elegí la fecha y hora del gasto.')
    .refine(isValidDatetimeLocal, 'Ingresá una fecha y hora válidas.'),
});

export type ExpenseFormInput = z.input<typeof expenseSchema>;
export type ExpenseFormValues = z.output<typeof expenseSchema>;
