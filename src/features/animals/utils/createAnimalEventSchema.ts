import { z } from 'zod';

import { localDayStartMs, OCCURRED_AT_FUTURE_TOLERANCE_MS } from '@/core/validation';

export const MANUAL_ANIMAL_EVENT_TYPES = ['general_note', 'behavior_note', 'transfer'] as const;
export const ANIMAL_EVENT_FUTURE_TOLERANCE_MS = OCCURRED_AT_FUTURE_TOLERANCE_MS;

const baseAnimalEventSchema = z.object({
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

function occurredAtWithinWindow(
  values: { occurredAt?: string | undefined },
  intakeDate: string,
  context: z.RefinementCtx
): void {
  if (values.occurredAt === undefined) {
    return;
  }
  const occurredAtMs = Date.parse(values.occurredAt);
  if (Number.isNaN(occurredAtMs)) {
    return;
  }
  const intakeStartMs = localDayStartMs(intakeDate);
  if (intakeStartMs !== null && occurredAtMs < intakeStartMs) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['occurredAt'],
      message: 'La fecha y hora no puede ser anterior al ingreso del animal.',
    });
  }
  if (occurredAtMs > Date.now() + OCCURRED_AT_FUTURE_TOLERANCE_MS) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['occurredAt'],
      message: 'La fecha y hora no puede estar en el futuro.',
    });
  }
}

/**
 * Esquema del alta de un evento general. La `intakeDate` (YYYY-MM-DD) define el
 * límite inferior: un evento no puede ocurrir antes del inicio del día de
 * ingreso del animal. Sin `intakeDate` solo se valida el formato y el límite
 * futuro (tolerancia de 60 s).
 */
export function createAnimalEventSchema(intakeDate = '') {
  return baseAnimalEventSchema.superRefine((values, context) =>
    occurredAtWithinWindow(values, intakeDate, context)
  );
}

export type CreateAnimalEventFormInput = z.input<ReturnType<typeof createAnimalEventSchema>>;
export type CreateAnimalEventFormValues = z.output<ReturnType<typeof createAnimalEventSchema>>;
