import type { components } from '@/core/api/generated/openapi';

export type UserRole = components['schemas']['UserResponseDto']['roles'][number];

export const CAPABILITIES = [
  'canEditAnimal',
  'canReadClinicalRecords',
  'canManageUsers',
  'canManageExpenses',
  'canManageVets',
  'canManageAdoptions',
  'canReadAudit',
] as const;

export type Capability = (typeof CAPABILITIES)[number];
export type RoleCapabilities = Readonly<Record<Capability, boolean>>;

export const ROLE_CAPABILITIES: Readonly<Record<UserRole, RoleCapabilities>> = {
  admin: {
    canEditAnimal: true,
    canReadClinicalRecords: true,
    canManageUsers: true,
    canManageExpenses: true,
    canManageVets: true,
    canManageAdoptions: true,
    canReadAudit: true,
  },
  shelter_manager: {
    canEditAnimal: true,
    canReadClinicalRecords: false,
    canManageUsers: false,
    canManageExpenses: true,
    canManageVets: true,
    canManageAdoptions: true,
    canReadAudit: false,
  },
  veterinarian: {
    canEditAnimal: false,
    canReadClinicalRecords: true,
    canManageUsers: false,
    canManageExpenses: false,
    canManageVets: false,
    canManageAdoptions: false,
    canReadAudit: false,
  },
};

export function capabilitiesForRoles(roles: readonly UserRole[]): RoleCapabilities {
  return Object.fromEntries(
    CAPABILITIES.map((capability) => [
      capability,
      roles.some((role) => ROLE_CAPABILITIES[role]?.[capability] === true),
    ])
  ) as unknown as RoleCapabilities;
}

export function hasCapability(capabilities: RoleCapabilities, capability: Capability): boolean {
  return capabilities[capability];
}

export function canEditAnimal(roles: readonly UserRole[]): boolean {
  return capabilitiesForRoles(roles).canEditAnimal;
}

export function canReadClinicalRecords(roles: readonly UserRole[]): boolean {
  return capabilitiesForRoles(roles).canReadClinicalRecords;
}

export function canManageUsers(roles: readonly UserRole[]): boolean {
  return capabilitiesForRoles(roles).canManageUsers;
}

export function canManageExpenses(roles: readonly UserRole[]): boolean {
  return capabilitiesForRoles(roles).canManageExpenses;
}

export function canManageVets(roles: readonly UserRole[]): boolean {
  return capabilitiesForRoles(roles).canManageVets;
}

export function canManageAdoptions(roles: readonly UserRole[]): boolean {
  return capabilitiesForRoles(roles).canManageAdoptions;
}

export function canReadAudit(roles: readonly UserRole[]): boolean {
  return capabilitiesForRoles(roles).canReadAudit;
}
