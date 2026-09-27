import {
  CAPABILITIES,
  capabilitiesForRoles,
  hasCapability,
  ROLE_CAPABILITIES,
} from './capabilities';

describe('capabilitiesForRoles', () => {
  it('declares the capability set frozen from the backend', () => {
    expect(CAPABILITIES).toEqual([
      'canEditAnimal',
      'canReadClinicalRecords',
      'canManageUsers',
      'canManageExpenses',
      'canManageVets',
      'canReadAudit',
    ]);
  });

  it('grants admin every capability', () => {
    expect(capabilitiesForRoles(['admin'])).toEqual({
      canEditAnimal: true,
      canReadClinicalRecords: true,
      canManageUsers: true,
      canManageExpenses: true,
      canManageVets: true,
      canReadAudit: true,
    });
  });

  it('keeps audit, users and clinical records away from shelter managers', () => {
    const capabilities = capabilitiesForRoles(['shelter_manager']);
    expect(capabilities.canReadAudit).toBe(false);
    expect(capabilities.canManageUsers).toBe(false);
    expect(capabilities.canReadClinicalRecords).toBe(false);
    expect(capabilities.canEditAnimal).toBe(true);
    expect(capabilities.canManageExpenses).toBe(true);
    expect(capabilities.canManageVets).toBe(true);
  });

  it('only grants veterinarians clinical reading', () => {
    expect(capabilitiesForRoles(['veterinarian'])).toEqual({
      canEditAnimal: false,
      canReadClinicalRecords: true,
      canManageUsers: false,
      canManageExpenses: false,
      canManageVets: false,
      canReadAudit: false,
    });
  });

  it('merges capabilities across multiple roles with OR semantics', () => {
    const capabilities = capabilitiesForRoles(['veterinarian', 'shelter_manager']);
    expect(capabilities.canReadClinicalRecords).toBe(true);
    expect(capabilities.canEditAnimal).toBe(true);
    expect(capabilities.canManageExpenses).toBe(true);
    expect(capabilities.canReadAudit).toBe(false);
  });

  it('returns no capabilities for an empty role list', () => {
    const capabilities = capabilitiesForRoles([]);
    for (const capability of CAPABILITIES) {
      expect(capabilities[capability]).toBe(false);
    }
  });

  it('keeps every role row aligned with the backend matrix', () => {
    expect(ROLE_CAPABILITIES.admin).toEqual(capabilitiesForRoles(['admin']));
    expect(ROLE_CAPABILITIES.shelter_manager).toEqual(capabilitiesForRoles(['shelter_manager']));
    expect(ROLE_CAPABILITIES.veterinarian).toEqual(capabilitiesForRoles(['veterinarian']));
  });

  it('hasCapability delegates to the merged record', () => {
    const admin = capabilitiesForRoles(['admin']);
    const veterinarian = capabilitiesForRoles(['veterinarian']);
    expect(hasCapability(admin, 'canReadAudit')).toBe(true);
    expect(hasCapability(veterinarian, 'canReadAudit')).toBe(false);
  });
});
