import { getActorInitials } from '@/components/patterns';
import { ApiError, toApiErrorMessage } from '@/core/api';

import type {
  VeterinarianListFilters,
  VeterinarianResponse,
  VeterinarianStatusFilter,
} from '../types';

export type VeterinarianCreateConflictField = 'createUserEmail' | 'licenseNumber';

export interface VeterinarianCreateErrorPresentation {
  field: VeterinarianCreateConflictField | null;
  message: string;
}

export function veterinarianFullName(veterinarian: VeterinarianResponse): string {
  return `${veterinarian.firstName} ${veterinarian.lastName}`.trim();
}

export function veterinarianInitials(
  veterinarian: Pick<VeterinarianResponse, 'firstName' | 'lastName'>
): string {
  return getActorInitials(veterinarian.firstName, veterinarian.lastName);
}

type LinkedVeterinarianUser = NonNullable<VeterinarianResponse['user']>;

const USER_ROLE_LABELS: Record<LinkedVeterinarianUser['roles'][number], string> = {
  admin: 'Administrador',
  shelter_manager: 'Encargado de refugio',
  veterinarian: 'Veterinario',
};

export function veterinarianLinkedUserName(user: LinkedVeterinarianUser): string {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name || user.email;
}

export function formatVeterinarianUserRoles(roles: LinkedVeterinarianUser['roles']): string {
  if (roles.length === 0) return 'Sin rol';
  return roles.map((role) => USER_ROLE_LABELS[role]).join(', ');
}

/**
 * Preferred professional email of the veterinarian, falling back to the linked
 * access user email. Returns `undefined` (never a placeholder) when neither
 * exists, so the card omits the line instead of inventing contact data.
 */
export function veterinarianContactEmail(veterinarian: VeterinarianResponse): string | undefined {
  const email = veterinarian.email?.trim() || veterinarian.user?.email?.trim();
  return email ? email : undefined;
}

export function veterinarianContactPhone(veterinarian: VeterinarianResponse): string | undefined {
  const phone = veterinarian.phone?.trim();
  return phone ? phone : undefined;
}

/**
 * Quick-search heuristic for the single visible search box: a term with digits
 * searches by license number, otherwise by name. The backend combines filters
 * in AND, so only one is ever sent from the quick search.
 */
export function toVeterinarianSearchFilter(search: string): VeterinarianListFilters {
  const term = search.trim();
  if (term === '') return {};
  return /\d/.test(term) ? { licenseNumber: term } : { name: term };
}

/**
 * Explicit filters from the advanced filter sheet. Allows sending `name` and
 * `licenseNumber` together (AND), which the quick-search heuristic cannot.
 * Blank fields are omitted so they never narrow the query.
 */
export function toVeterinarianAdvancedFilters(
  name: string,
  licenseNumber: string
): VeterinarianListFilters {
  const trimmedName = name.trim();
  const trimmedLicense = licenseNumber.trim();
  return {
    ...(trimmedName !== '' ? { name: trimmedName } : {}),
    ...(trimmedLicense !== '' ? { licenseNumber: trimmedLicense } : {}),
  };
}

export function hasActiveVeterinarianFilters(
  filters: VeterinarianListFilters,
  status: VeterinarianStatusFilter
): boolean {
  return (
    status !== 'all' ||
    (filters.name !== undefined && filters.name !== '') ||
    (filters.licenseNumber !== undefined && filters.licenseNumber !== '')
  );
}

/**
 * Full accessible label of the list card: identity, license, the contact lines
 * that are actually shown and the state as text. Keeps the whole row a single
 * announced button without leaking a UUID.
 */
export function veterinarianAccessibilityLabel(veterinarian: VeterinarianResponse): string {
  const parts = [veterinarianFullName(veterinarian), `matrícula ${veterinarian.licenseNumber}`];
  const email = veterinarianContactEmail(veterinarian);
  const phone = veterinarianContactPhone(veterinarian);
  if (email) parts.push(`email ${email}`);
  if (phone) parts.push(`teléfono ${phone}`);
  parts.push(veterinarian.isActive ? 'Activo' : 'Inactivo');
  return parts.join(', ');
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
