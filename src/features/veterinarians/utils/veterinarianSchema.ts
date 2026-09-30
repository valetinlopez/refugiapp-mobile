import { z } from 'zod';

import { isUuid } from '@/core/validation';

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === undefined || value === '' ? undefined : value))
  .refine(
    (value) => value === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    'Ingresá un email válido.'
  );

const optionalUuid = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === undefined || value === '' ? undefined : value))
  .refine((value) => value === undefined || isUuid(value), 'Ingresá un ID de usuario válido.');

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === undefined || value === '' ? undefined : value));

export const veterinarianFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Ingresá el nombre.'),
  lastName: z.string().trim().min(1, 'Ingresá el apellido.'),
  licenseNumber: z
    .string()
    .trim()
    .min(1, 'Ingresá la matrícula.')
    .max(80, 'La matrícula no puede superar los 80 caracteres.'),
  email: optionalEmail,
  phone: optionalText,
  userId: optionalUuid,
  notes: optionalText,
});

export type VeterinarianFormInput = z.input<typeof veterinarianFormSchema>;
export type VeterinarianFormValues = z.output<typeof veterinarianFormSchema>;

export type VeterinarianFormMode = 'create' | 'edit';
