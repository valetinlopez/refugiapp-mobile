import {
  CAPABILITIES,
  ROLE_CAPABILITIES,
  canEditAnimal,
  canManageExpenses,
  canManageAdoptions,
  canManageUsers,
  canManageVets,
  canReadAudit,
  canReadClinicalRecords,
  capabilitiesForRoles,
  hasCapability,
  type Capability,
  type UserRole,
} from './capabilities';

const EXPECTED_MATRIX: Record<UserRole, Record<Capability, boolean>> = {
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

describe('role capabilities registry', () => {
  it.each(Object.entries(EXPECTED_MATRIX) as [UserRole, Record<Capability, boolean>][])(
    'maps every capability for %s',
    (role, expected) => {
      expect(capabilitiesForRoles([role])).toEqual(expected);
      expect(ROLE_CAPABILITIES[role]).toEqual(expected);
      for (const capability of CAPABILITIES) {
        expect(hasCapability(expected, capability)).toBe(expected[capability]);
      }
    }
  );

  it('denies every capability when no role is present', () => {
    expect(capabilitiesForRoles([])).toEqual(
      Object.fromEntries(CAPABILITIES.map((capability) => [capability, false]))
    );
  });

  it('merges multiple roles with OR semantics', () => {
    expect(capabilitiesForRoles(['shelter_manager', 'veterinarian'])).toEqual({
      canEditAnimal: true,
      canReadClinicalRecords: true,
      canManageUsers: false,
      canManageExpenses: true,
      canManageVets: true,
      canManageAdoptions: true,
      canReadAudit: false,
    });
  });

  it('denies capabilities for an unexpected runtime role', () => {
    expect(capabilitiesForRoles(['unknown' as UserRole])).toEqual(
      Object.fromEntries(CAPABILITIES.map((capability) => [capability, false]))
    );
  });

  it('exposes named helpers for route guards', () => {
    expect(canEditAnimal(['shelter_manager'])).toBe(true);
    expect(canReadClinicalRecords(['veterinarian'])).toBe(true);
    expect(canManageUsers(['admin'])).toBe(true);
    expect(canManageExpenses(['shelter_manager'])).toBe(true);
    expect(canManageVets(['shelter_manager'])).toBe(true);
    expect(canManageAdoptions(['shelter_manager'])).toBe(true);
    expect(canReadAudit(['admin'])).toBe(true);

    expect(canEditAnimal(['veterinarian'])).toBe(false);
    expect(canReadClinicalRecords(['shelter_manager'])).toBe(false);
    expect(canManageUsers(['veterinarian'])).toBe(false);
    expect(canManageExpenses(['veterinarian'])).toBe(false);
    expect(canManageVets(['veterinarian'])).toBe(false);
    expect(canManageAdoptions(['veterinarian'])).toBe(false);
    expect(canReadAudit(['shelter_manager'])).toBe(false);
  });
});
