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
      visible: ['veterinarians', 'users', 'audit'],
    },
    {
      blocked: ['users', 'audit'],
      role: 'shelter_manager',
      visible: ['veterinarians'],
    },
    {
      blocked: ['users', 'audit'],
      role: 'veterinarian',
      visible: ['veterinarians'],
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
    expect(destinationIds([])).toEqual(['veterinarians']);
  });

  it('removes privileged destinations when capabilities are lost', () => {
    expect(destinationIds(['admin'])).toContain('users');
    expect(destinationIds(['veterinarian'])).not.toContain('users');
    expect(destinationIds(['veterinarian'])).not.toContain('audit');
  });
});
