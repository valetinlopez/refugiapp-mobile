import { z } from 'zod';

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === undefined || value === '' ? undefined : value))
  .refine(
    (value) => value === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    'Ingresá un email válido.'
  );

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === undefined || value === '' ? undefined : value));

const optionalPassword = z
  .string()
  .optional()
  .transform((value) => (value === undefined || value === '' ? undefined : value));

const veterinarianFormShape = {
  firstName: z.string().trim().min(1, 'Ingresá el nombre.'),
  lastName: z.string().trim().min(1, 'Ingresá el apellido.'),
  licenseNumber: z
    .string()
    .trim()
    .min(1, 'Ingresá la matrícula.')
    .max(80, 'La matrícula no puede superar los 80 caracteres.'),
  email: optionalEmail,
  phone: optionalText,
  notes: optionalText,
  shouldCreateUser: z.boolean(),
  createUserEmail: optionalEmail,
  createUserPassword: optionalPassword,
};

const veterinarianFormBase = z.object(veterinarianFormShape);

export const veterinarianFormSchema = veterinarianFormBase.superRefine((values, ctx) => {
  if (!values.shouldCreateUser) {
    return;
  }

  const password = values.createUserPassword;
  if (password === undefined || password.length < 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['createUserPassword'],
      message: 'La contraseña debe tener al menos 12 caracteres.',
    });
    return;
  }

  if (values.createUserEmail === undefined && values.email === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['createUserEmail'],
      message: 'Ingresá el email del veterinario o del usuario para crear el acceso.',
    });
  }
});

export type VeterinarianFieldName = keyof typeof veterinarianFormShape;

export type VeterinarianFormInput = z.input<typeof veterinarianFormSchema>;
export type VeterinarianFormValues = z.output<typeof veterinarianFormSchema>;

export type VeterinarianFormMode = 'create' | 'edit';
