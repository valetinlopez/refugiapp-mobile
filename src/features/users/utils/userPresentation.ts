import { ApiError } from '@/core/api';
import { isNetworkError } from '@/core/network';

import type { ManagedUserRole } from '../types';

const ROLE_LABELS: Record<ManagedUserRole, string> = {
  admin: 'Administrador',
  shelter_manager: 'Encargado de refugio',
  veterinarian: 'Veterinario',
};

const ROLE_DESCRIPTIONS: Record<ManagedUserRole, string> = {
  admin: 'Acceso completo y gestión de usuarios.',
  shelter_manager: 'Gestiona animales, cuidados, gastos y veterinarios.',
  veterinarian: 'Consulta animales y gestiona la historia clínica.',
};

export function roleLabel(role: ManagedUserRole): string {
  return ROLE_LABELS[role];
}

export function roleDescription(role: ManagedUserRole): string {
  return ROLE_DESCRIPTIONS[role];
}

export function toCreateUserErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Sin conexión. Revisá tu conexión y volvé a intentar.';
  }
  if (error instanceof ApiError) {
    if (error.code === 'EMAIL_ALREADY_EXISTS' || error.status === 409) {
      return 'Ya existe un usuario registrado con ese email.';
    }
    if (error.status === 403) {
      return 'Tu rol no tiene permiso para crear usuarios.';
    }
    if (error.code === 'INVALID_PAYLOAD' || error.status === 400 || error.status === 422) {
      return 'Revisá el email, la contraseña y los roles seleccionados.';
    }
  }
  return 'No pudimos crear el usuario. Intentá nuevamente.';
}

export function toUserErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'LAST_ADMIN_FORBIDDEN') {
      return 'No se puede quitar el rol de administrador al último administrador activo.';
    }
    if (error.code === 'EMAIL_ALREADY_EXISTS' || error.status === 409) {
      return 'Ya existe un usuario registrado con ese email.';
    }
    if (
      error.code === 'EMPTY_UPDATE_PAYLOAD' ||
      error.code === 'INVALID_PAYLOAD' ||
      error.status === 400
    ) {
      return 'Revisá los datos ingresados. No hay cambios válidos para guardar.';
    }
    if (error.status === 403) {
      return 'Tu rol no tiene permiso para gestionar usuarios.';
    }
    if (error.status === 404) {
      return 'El usuario ya no está disponible.';
    }
  }
  return 'No pudimos completar la operación. Intentá nuevamente.';
}
