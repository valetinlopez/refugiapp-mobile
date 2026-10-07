import { render, waitFor } from '@testing-library/react-native';

import { capabilitiesForRoles, type UserRole } from '@/application/authorization';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import UsersRoute from '../index';
import NewUserRoute from '../new';
import EditUserRoute from '../[id]/edit';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({ id: '11111111-1111-4111-8111-111111111111' }),
}));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountHeaderRow', () => ({ AccountHeaderRow: () => null }));
jest.mock('@/components/navigation', () => ({ navigateBack: jest.fn() }));
jest.mock('@/components/patterns', () => ({ DecorativeBackground: () => null }));
jest.mock('react', () => ({
  ...jest.requireActual<typeof import('react')>('react'),
  lazy: () => () => null,
}));

const mockUseCapabilities = useCapabilities as jest.MockedFunction<typeof useCapabilities>;

const ROLE_ACCESS = [
  { allowed: true, role: 'admin' },
  { allowed: false, role: 'shelter_manager' },
  { allowed: false, role: 'veterinarian' },
] as const satisfies readonly { allowed: boolean; role: UserRole }[];

describe('user management deep-link guards', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(ROLE_ACCESS)('guards the users list for $role', async ({ allowed, role }) => {
    mockUseCapabilities.mockReturnValue(capabilitiesForRoles([role]));
    const screen = await render(<UsersRoute />);

    if (allowed) {
      expect(screen.queryByText('Sin permiso')).toBeNull();
    } else {
      expect(screen.getByText('Sin permiso')).toBeTruthy();
    }
  });

  it.each(ROLE_ACCESS)('guards the create-user deep link for $role', async ({ allowed, role }) => {
    mockUseCapabilities.mockReturnValue(capabilitiesForRoles([role]));
    const screen = await render(<NewUserRoute />);

    if (allowed) {
      expect(screen.queryByText('Sin permiso')).toBeNull();
    } else {
      expect(screen.getByText('Sin permiso')).toBeTruthy();
    }
  });

  it.each(ROLE_ACCESS)('guards the edit-user deep link for $role', async ({ allowed, role }) => {
    mockUseCapabilities.mockReturnValue(capabilitiesForRoles([role]));
    const screen = await render(<EditUserRoute />);

    if (allowed) {
      expect(screen.queryByText('Sin permiso')).toBeNull();
    } else {
      expect(screen.getByText('Sin permiso')).toBeTruthy();
    }
  });

  it('replaces protected content when management permission is lost in-session', async () => {
    mockUseCapabilities.mockReturnValue(capabilitiesForRoles(['admin']));
    const screen = await render(<NewUserRoute />);
    expect(screen.queryByText('Sin permiso')).toBeNull();

    mockUseCapabilities.mockReturnValue(capabilitiesForRoles(['veterinarian']));
    screen.rerender(<NewUserRoute />);

    await waitFor(() => expect(screen.getByText('Sin permiso')).toBeTruthy());
  });
});
