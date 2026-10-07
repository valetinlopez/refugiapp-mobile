import { accountDisplayName, accountInitials } from './accountPresentation';

describe('account presentation', () => {
  it('builds the display name and initials from the current user', () => {
    const user = { email: 'andres@refugiapp.org', firstName: 'Andrés', lastName: 'Borrego' };

    expect(accountDisplayName(user)).toBe('Andrés Borrego');
    expect(accountInitials(user)).toBe('AB');
  });

  it('falls back to the email when names are blank', () => {
    const user = { email: 'team@refugiapp.org', firstName: ' ', lastName: '' };

    expect(accountDisplayName(user)).toBe('team@refugiapp.org');
    expect(accountInitials(user)).toBe('te');
  });
});
