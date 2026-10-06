import { z } from 'zod';

const internationalPhone = /^\+?[1-9]\d{7,14}$/;

export const adopterSchema = z.object({
  firstName: z.string().trim().min(1, 'Ingresá el nombre.').max(100, 'Usá hasta 100 caracteres.'),
  lastName: z.string().trim().min(1, 'Ingresá el apellido.').max(100, 'Usá hasta 100 caracteres.'),
  email: z
    .string()
    .trim()
    .email('Ingresá un email válido.')
    .max(320, 'Usá hasta 320 caracteres.')
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .regex(
      internationalPhone,
      'Ingresá un teléfono internacional válido, por ejemplo +5491123456789.'
    )
    .max(32, 'Usá hasta 32 caracteres.'),
  address: z
    .string()
    .trim()
    .max(255, 'Usá hasta 255 caracteres.')
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
});

export type AdopterFormInput = z.input<typeof adopterSchema>;
export type AdopterFormValues = z.output<typeof adopterSchema>;
