import { z } from 'zod';

export const ANIMAL_SEX_VALUES = ['female', 'male', 'unknown'] as const;
export const ANIMAL_STATUS_VALUES = [
  'admitted',
  'under_treatment',
  'available_for_adoption',
  'adopted',
  'deceased',
] as const;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toDateParts(value: string): { day: number; month: number; year: number } | null {
  const parts = value.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (year === undefined || month === undefined || day === undefined) {
    return null;
  }
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  return { day, month, year };
}

export function isCalendarDate(value: string): boolean {
  const parts = toDateParts(value);
  if (parts === null) {
    return false;
  }
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return (
    date.getUTCFullYear() === parts.year &&
    date.getUTCMonth() === parts.month - 1 &&
    date.getUTCDate() === parts.day
  );
}

export function todayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${String(year)}-${month}-${day}`;
}

const optionalText = (maxLength: number, tooLongMessage: string) =>
  z
    .string()
    .trim()
    .max(maxLength, tooLongMessage)
    .optional()
    .transform((value) => (value === undefined || value === '' ? undefined : value));

export const animalProfileFields = {
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(120, 'El nombre no puede superar los 120 caracteres.'),
  species: z
    .string()
    .trim()
    .min(1, 'La especie es obligatoria.')
    .max(80, 'La especie no puede superar los 80 caracteres.'),
  breed: optionalText(80, 'La raza no puede superar los 80 caracteres.'),
  sex: z
    .enum(ANIMAL_SEX_VALUES, {
      errorMap: () => ({ message: 'El sexo seleccionado no es válido.' }),
    })
    .optional()
    .default('unknown'),
  intakeDate: z
    .string()
    .trim()
    .min(1, 'La fecha de ingreso es obligatoria.')
    .refine(
      (value) => DATE_PATTERN.test(value),
      'La fecha de ingreso debe tener formato AAAA-MM-DD.'
    )
    .refine((value) => isCalendarDate(value), 'La fecha de ingreso no es una fecha válida.')
    .refine((value) => value <= todayLocalDate(), 'La fecha de ingreso no puede ser futura.'),
  birthDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === undefined || value === '' ? undefined : value))
    .refine(
      (value) => value === undefined || DATE_PATTERN.test(value),
      'La fecha de nacimiento debe tener formato AAAA-MM-DD.'
    )
    .refine(
      (value) => value === undefined || isCalendarDate(value),
      'La fecha de nacimiento no es una fecha válida.'
    ),
} as const;

export function birthDateBeforeIntakeRefine(
  values: { birthDate?: string | undefined; intakeDate: string },
  context: z.RefinementCtx
): void {
  if (
    values.birthDate !== undefined &&
    DATE_PATTERN.test(values.intakeDate) &&
    isCalendarDate(values.intakeDate) &&
    isCalendarDate(values.birthDate) &&
    values.birthDate > values.intakeDate
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['birthDate'],
      message: 'La fecha de nacimiento no puede ser posterior a la fecha de ingreso.',
    });
  }
}

export const createAnimalSchema = z
  .object({
    ...animalProfileFields,
    status: z
      .enum(ANIMAL_STATUS_VALUES, {
        errorMap: () => ({ message: 'El estado seleccionado no es válido.' }),
      })
      .optional()
      .default('admitted'),
  })
  .superRefine(birthDateBeforeIntakeRefine);

export type CreateAnimalFormInput = z.input<typeof createAnimalSchema>;
export type CreateAnimalFormValues = z.output<typeof createAnimalSchema>;
