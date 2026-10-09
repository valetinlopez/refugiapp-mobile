import { ApiError, toApiErrorMessage } from '@/core/api';

import type { VeterinarianResponse } from '../types';

export type VeterinarianCreateConflictField = 'createUserEmail' | 'licenseNumber';

export interface VeterinarianCreateErrorPresentation {
  field: VeterinarianCreateConflictField | null;
  message: string;
}

export function veterinarianFullName(veterinarian: VeterinarianResponse): string {
  return `${veterinarian.firstName} ${veterinarian.lastName}`.trim();
}

export function toVeterinarianSearchFilter(search: string): {
  name?: string;
  licenseNumber?: string;
} {
  const term = search.trim();
  if (term === '') return {};
  return /\d/.test(term) ? { licenseNumber: term } : { name: term };
}

export function toVeterinarianErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'LICENSE_NUMBER_ALREADY_EXISTS') {
      return 'Ya existe un veterinario con esa matrícula.';
    }
    if (error.code === 'EMAIL_ALREADY_EXISTS') {
      return 'Ese email ya está registrado como usuario. Usá otro o contactá a un administrador.';
    }
    if (error.code === 'USER_ALREADY_LINKED_TO_VETERINARIAN') {
      return 'Ese usuario ya está vinculado a otro veterinario.';
    }
    if (error.code === 'VET_USER_PAYLOAD_CONFLICT') {
      return 'No se puede vincular un usuario y crear otro a la vez. Elegí una sola opción.';
    }
    if (error.code === 'VET_CREATE_USER_EMAIL_REQUIRED') {
      return 'Falta el email para crear el acceso. Completá el email del veterinario o del usuario.';
    }
    if (error.code === 'VETERINARIAN_ALREADY_ACTIVE') {
      return 'Este veterinario ya está activo.';
    }
    if (error.status === 403) {
      return 'Tu rol no tiene permiso para gestionar veterinarios.';
    }
    if (error.status === 404) {
      return 'El veterinario ya no está disponible.';
    }
  }
  return toApiErrorMessage(error);
}

/**
 * Places create conflicts next to the credential that must be corrected.
 *
 * The backend keeps the create operation atomic; this presentation only helps
 * the operator distinguish the two recoverable conflicts without exposing the
 * server payload or request identifiers.
 */
export function toVeterinarianCreateErrorPresentation(
  error: unknown
): VeterinarianCreateErrorPresentation {
  const message = toVeterinarianErrorMessage(error);

  if (error instanceof ApiError) {
    if (error.code === 'LICENSE_NUMBER_ALREADY_EXISTS') {
      return { field: 'licenseNumber', message };
    }
    if (
      error.code === 'EMAIL_ALREADY_EXISTS' ||
      error.code === 'USER_ALREADY_LINKED_TO_VETERINARIAN' ||
      error.code === 'VET_CREATE_USER_EMAIL_REQUIRED'
    ) {
      return { field: 'createUserEmail', message };
    }
  }

  return { field: null, message };
}
