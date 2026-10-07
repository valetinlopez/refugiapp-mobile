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
  roles: z
    .array(z.enum(managedUserRoles))
    .min(1, 'Seleccioná al menos un rol.')
    .max(managedUserRoles.length),
});

export type CreateUserFormInput = z.input<typeof createUserSchema>;
export type CreateUserFormValues = z.output<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Ingresá el email.')
    .email('Ingresá un email válido.')
    .max(320, 'Ingresá un email válido.'),
  firstName: z.string().trim().min(1, 'Ingresá el nombre.').max(100, 'Máximo 100 caracteres.'),
  lastName: z.string().trim().min(1, 'Ingresá el apellido.').max(100, 'Máximo 100 caracteres.'),
  role: z.enum(managedUserRoles, { required_error: 'Seleccioná un rol.' }),
});

export type UpdateUserFormInput = z.input<typeof updateUserSchema>;
export type UpdateUserFormValues = z.output<typeof updateUserSchema>;
