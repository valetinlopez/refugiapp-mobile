import { ApiError } from '@/core/api';

import type { ManagedUserRole } from '../types';

const ROLE_LABELS: Record<ManagedUserRole, string> = {
  admin: 'Administrador',
  shelter_manager: 'Encargado de refugio',
  veterinarian: 'Veterinario',
};

export function roleLabel(role: ManagedUserRole): string {
  return ROLE_LABELS[role];
}

export function toUserErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'EMAIL_ALREADY_EXISTS' || error.status === 409) {
      return 'Ya existe un usuario registrado con ese email.';
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
