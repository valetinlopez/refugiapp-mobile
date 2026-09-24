import { z } from 'zod';

import type { MedicalRecordType } from '../types';
import { intakeStartOfDayMs, OCCURRED_AT_FUTURE_TOLERANCE_MS } from './occurredAtWindow';
import { isUuid } from './uuid';

export const MEDICAL_RECORD_TYPE_VALUES = [
  'consultation',
  'vaccination',
  'deworming',
  'surgery',
  'lab_result',
  'treatment',
  'other',
] as const;

export const MAX_MEDICAL_ATTACHMENTS = 10;

const recordType = z.enum(MEDICAL_RECORD_TYPE_VALUES, {
  errorMap: () => ({ message: 'El tipo de registro seleccionado no es válido.' }),
});

const title = z
  .string()
  .trim()
  .min(3, 'El título debe tener al menos 3 caracteres.')
  .max(160, 'El título no puede superar los 160 caracteres.');

const occurredAt = z
  .string()
  .trim()
  .min(1, 'La fecha y hora es obligatoria.')
  .refine(
    (value) => z.string().datetime({ offset: true }).safeParse(value).success,
    'La fecha y hora debe tener formato ISO 8601.'
  );

const optionalVeterinarianId = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === undefined || value === '' ? undefined : value))
  .refine(
    (value) => value === undefined || isUuid(value),
    'El veterinario seleccionado no es válido.'
  );

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === undefined || value === '' ? undefined : value));

const optionalAttachmentMediaIds = z
  .array(z.string().refine((value) => isUuid(value), 'Un adjunto seleccionado no es válido.'))
  .max(MAX_MEDICAL_ATTACHMENTS, `No podés adjuntar más de ${MAX_MEDICAL_ATTACHMENTS} archivos.`)
  .optional();

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
  const intakeStartMs = intakeStartOfDayMs(intakeDate);
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
      message: 'La fecha y hora no puede ser futura.',
    });
  }
}

export function createMedicalRecordSchema(intakeDate: string) {
  return z
    .object({
      animalId: z.string().refine((value) => isUuid(value), 'Seleccioná un animal válido.'),
      recordType,
      title,
      occurredAt,
      veterinarianId: optionalVeterinarianId,
      diagnosis: optionalText,
      treatment: optionalText,
      notes: optionalText,
      attachmentMediaIds: optionalAttachmentMediaIds,
    })
    .superRefine((values, context) => occurredAtWithinWindow(values, intakeDate, context));
}

export function updateMedicalRecordSchema(intakeDate: string) {
  return z
    .object({
      recordType,
      title,
      occurredAt,
      veterinarianId: optionalVeterinarianId,
      diagnosis: optionalText,
      treatment: optionalText,
      notes: optionalText,
    })
    .superRefine((values, context) => occurredAtWithinWindow(values, intakeDate, context));
}

export type CreateMedicalRecordFormInput = z.input<ReturnType<typeof createMedicalRecordSchema>>;
export type CreateMedicalRecordFormValues = z.output<ReturnType<typeof createMedicalRecordSchema>>;
export type UpdateMedicalRecordFormInput = z.input<ReturnType<typeof updateMedicalRecordSchema>>;
export type UpdateMedicalRecordFormValues = z.output<ReturnType<typeof updateMedicalRecordSchema>>;

export type MedicalRecordFormValues = CreateMedicalRecordFormValues | UpdateMedicalRecordFormValues;

export interface MedicalRecordRecordFields {
  recordType: MedicalRecordType;
  title: string;
  occurredAt: string;
  veterinarianId: string | null;
  diagnosis: string | null;
  treatment: string | null;
  notes: string | null;
}
