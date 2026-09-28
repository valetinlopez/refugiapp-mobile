import type { UserRole } from '@/features/auth/types';

export function getAnimalDetailCapabilities(roles: UserRole[]) {
  return {
    canEditAnimal: roles.some((role) => role === 'admin' || role === 'shelter_manager'),
    canReadClinicalRecords: roles.some((role) => role === 'admin' || role === 'veterinarian'),
  };
}
