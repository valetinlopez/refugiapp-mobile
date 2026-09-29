import { capabilitiesForRoles } from './capabilities';
import { filterAuthorizedDestinations } from './navigation';

const DESTINATIONS = [
  { id: 'animals' },
  { id: 'users', requiredCapability: 'canManageUsers' as const },
  { id: 'audit', requiredCapability: 'canReadAudit' as const },
  { id: 'expenses', requiredCapability: 'canManageExpenses' as const },
] as const;

describe('filterAuthorizedDestinations', () => {
  it('keeps public and administrative destinations for admin', () => {
    expect(
      filterAuthorizedDestinations(DESTINATIONS, capabilitiesForRoles(['admin'])).map(
        ({ id }) => id
      )
    ).toEqual(['animals', 'users', 'audit', 'expenses']);
  });

  it('keeps only public and expense destinations for shelter managers', () => {
    expect(
      filterAuthorizedDestinations(DESTINATIONS, capabilitiesForRoles(['shelter_manager'])).map(
        ({ id }) => id
      )
    ).toEqual(['animals', 'expenses']);
  });

  it('keeps only public destinations for veterinarians', () => {
    expect(
      filterAuthorizedDestinations(DESTINATIONS, capabilitiesForRoles(['veterinarian'])).map(
        ({ id }) => id
      )
    ).toEqual(['animals']);
  });
});
