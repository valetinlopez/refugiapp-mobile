import type { UserRole } from '@/types/design-system';

export const CAPABILITIES = [
  'canEditAnimal',
  'canReadClinicalRecords',
  'canManageUsers',
  'canManageExpenses',
  'canManageVets',
  'canReadAudit',
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export type RoleCapabilities = Record<Capability, boolean>;

export const ROLE_CAPABILITIES: Record<UserRole, RoleCapabilities> = {
  admin: {
    canEditAnimal: true,
    canReadClinicalRecords: true,
    canManageUsers: true,
    canManageExpenses: true,
    canManageVets: true,
    canReadAudit: true,
  },
  shelter_manager: {
    canEditAnimal: true,
    canReadClinicalRecords: false,
    canManageUsers: false,
    canManageExpenses: true,
    canManageVets: true,
    canReadAudit: false,
  },
  veterinarian: {
    canEditAnimal: false,
    canReadClinicalRecords: true,
    canManageUsers: false,
    canManageExpenses: false,
    canManageVets: false,
    canReadAudit: false,
  },
};

export function capabilitiesForRoles(roles: readonly UserRole[]): RoleCapabilities {
  const capabilities = {} as RoleCapabilities;
  for (const capability of CAPABILITIES) {
    capabilities[capability] = roles.some((role) => ROLE_CAPABILITIES[role][capability]);
  }
  return capabilities;
}

export function hasCapability(capabilities: RoleCapabilities, capability: Capability): boolean {
  return capabilities[capability];
}
