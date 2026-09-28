import type { UserRole } from '../types';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  shelter_manager: 'Encargado de refugio',
  veterinarian: 'Veterinario',
};

export function roleLabels(roles: readonly UserRole[]): string[] {
  return roles.map((role) => ROLE_LABELS[role] ?? role);
}
