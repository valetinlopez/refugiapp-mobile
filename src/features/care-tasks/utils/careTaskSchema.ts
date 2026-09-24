import { z } from 'zod';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const title = z
  .string()
  .trim()
  .min(3, 'El título debe tener al menos 3 caracteres.')
  .max(160, 'El título no puede superar los 160 caracteres.');

const optionalDescription = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === undefined || value === '' ? undefined : value));

const optionalDueAt = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === undefined || value === '' ? undefined : value))
  .refine(
    (value) =>
      value === undefined || z.string().datetime({ offset: true }).safeParse(value).success,
    'La fecha y hora debe tener formato ISO 8601.'
  )
  .refine(
    (value) => value === undefined || new Date(value).getTime() > Date.now(),
    'La fecha y hora debe ser futura.'
  );

export const createCareTaskSchema = z.object({
  animalId: z.string().refine((value) => UUID_PATTERN.test(value), 'Seleccioná un animal válido.'),
  title,
  description: optionalDescription,
  dueAt: optionalDueAt,
});

export const updateCareTaskSchema = z.object({
  title,
  description: optionalDescription,
  dueAt: optionalDueAt,
});

export type CreateCareTaskFormInput = z.input<typeof createCareTaskSchema>;
export type CreateCareTaskFormValues = z.output<typeof createCareTaskSchema>;
export type UpdateCareTaskFormInput = z.input<typeof updateCareTaskSchema>;
export type UpdateCareTaskFormValues = z.output<typeof updateCareTaskSchema>;
