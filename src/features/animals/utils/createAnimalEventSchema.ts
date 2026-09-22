import { z } from 'zod';

export const MANUAL_ANIMAL_EVENT_TYPES = ['general_note', 'behavior_note', 'transfer'] as const;

export const createAnimalEventSchema = z.object({
  eventType: z.enum(MANUAL_ANIMAL_EVENT_TYPES, {
    errorMap: () => ({ message: 'El tipo de evento seleccionado no es válido.' }),
  }),
  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(1000, 'La descripción no puede superar los 1000 caracteres.'),
  occurredAt: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === undefined || value === '' ? undefined : value))
    .refine(
      (value) =>
        value === undefined || z.string().datetime({ offset: true }).safeParse(value).success,
      'La fecha y hora debe tener formato ISO 8601.'
    ),
});

export type CreateAnimalEventFormInput = z.input<typeof createAnimalEventSchema>;
export type CreateAnimalEventFormValues = z.output<typeof createAnimalEventSchema>;
