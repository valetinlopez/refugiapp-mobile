import { z } from 'zod';

export const expenseCategories = [
  'food',
  'medicine',
  'veterinary',
  'supplies',
  'transport',
  'other',
] as const;

export const expenseSchema = z.object({
  animalId: z.string().uuid('Seleccioná un animal.'),
  category: z.enum(expenseCategories, { required_error: 'Seleccioná una categoría.' }),
  description: z.string().trim().min(1, 'Ingresá el concepto del gasto.'),
  amountCents: z
    .string()
    .trim()
    .min(1, 'Ingresá el importe en centavos.')
    .regex(/^\d+$/, 'El importe debe ser un número entero no negativo.')
    .refine((value) => Number.isSafeInteger(Number(value)), 'El importe es demasiado grande.'),
  incurredAt: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usá el formato AAAA-MM-DD.')
    .refine((value) => !Number.isNaN(Date.parse(`${value}T12:00:00`)), 'Ingresá una fecha válida.'),
});

export type ExpenseFormInput = z.input<typeof expenseSchema>;
export type ExpenseFormValues = z.output<typeof expenseSchema>;
