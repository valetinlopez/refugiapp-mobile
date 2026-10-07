import { capabilitiesForRoles } from '@/application/authorization';

import { getAuthorizedManagementDestinations } from './navigation';

function destinationIds(roles: Parameters<typeof capabilitiesForRoles>[0]) {
  return getAuthorizedManagementDestinations(capabilitiesForRoles(roles)).map(({ id }) => id);
}

describe('getAuthorizedManagementDestinations', () => {
  it('shows every destination to admins in deterministic order', () => {
    expect(destinationIds(['admin'])).toEqual(['veterinarians', 'users', 'audit']);
  });

  it.each([[['shelter_manager']], [['veterinarian']], [[]]] as const)(
    'keeps only veterinarians without administrative capabilities for %j',
    (roles) => {
      expect(destinationIds(roles)).toEqual(['veterinarians']);
    }
  );

  it('removes privileged destinations when capabilities are lost', () => {
    expect(destinationIds(['admin'])).toContain('users');
    expect(destinationIds(['veterinarian'])).not.toContain('users');
    expect(destinationIds(['veterinarian'])).not.toContain('audit');
  });
});
