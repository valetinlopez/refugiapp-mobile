import { z } from 'zod';

export const managedUserRoles = ['admin', 'shelter_manager', 'veterinarian'] as const;

export const createUserSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Ingresá el email.')
    .email('Ingresá un email válido.'),
  firstName: z.string().trim().min(1, 'Ingresá el nombre.'),
  lastName: z.string().trim().min(1, 'Ingresá el apellido.'),
  password: z.string().min(12, 'La contraseña debe tener al menos 12 caracteres.'),
  role: z.enum(managedUserRoles, { required_error: 'Seleccioná un rol.' }),
});

export type CreateUserFormInput = z.input<typeof createUserSchema>;
export type CreateUserFormValues = z.output<typeof createUserSchema>;
