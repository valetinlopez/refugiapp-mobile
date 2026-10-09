import { capabilitiesForRoles } from '@/application/authorization';

import { getAuthorizedManagementDestinations } from './navigation';

function destinationIds(roles: Parameters<typeof capabilitiesForRoles>[0]) {
  return getAuthorizedManagementDestinations(capabilitiesForRoles(roles)).map(({ id }) => id);
}

describe('getAuthorizedManagementDestinations', () => {
  it.each([
    {
      blocked: [],
      role: 'admin',
      visible: ['veterinarians', 'expenses', 'medical-records', 'users', 'audit'],
    },
    {
      blocked: ['users', 'audit', 'medical-records'],
      role: 'shelter_manager',
      visible: ['veterinarians', 'expenses'],
    },
    {
      blocked: ['users', 'audit'],
      role: 'veterinarian',
      visible: ['veterinarians', 'expenses', 'medical-records'],
    },
  ] as const)(
    'defines visible and blocked destinations for $role',
    ({ blocked, role, visible }) => {
      const authorized = destinationIds([role]);
      expect(authorized).toEqual(visible);
      blocked.forEach((destination) => expect(authorized).not.toContain(destination));
    }
  );

  it('denies privileged destinations when no capability is available', () => {
    expect(destinationIds([])).toEqual(['veterinarians', 'expenses']);
  });

  it('removes the clinical destination when the capability is lost', () => {
    expect(destinationIds(['admin'])).toContain('medical-records');
    expect(destinationIds(['shelter_manager'])).not.toContain('medical-records');
  });
});
