import { render, waitFor } from '@testing-library/react-native';

import { capabilitiesForRoles, type UserRole } from '@/application/authorization';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import MedicalRecordsRoute from '../index';

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}) }));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountHeaderRow', () => ({ AccountHeaderRow: () => null }));
jest.mock('@/components/navigation', () => ({ navigateBack: jest.fn() }));
jest.mock('@/features/medical-records/components/MedicalRecordsOverviewScreen', () => ({
  MedicalRecordsOverviewScreen: () => {
    const { Text } = jest.requireActual('react-native') as typeof import('react-native');
    return <Text>Historia clínica global</Text>;
  },
}));

const mockUseCapabilities = useCapabilities as jest.MockedFunction<typeof useCapabilities>;

const ROLE_ACCESS = [
  { allowed: true, role: 'admin' },
  { allowed: false, role: 'shelter_manager' },
  { allowed: true, role: 'veterinarian' },
] as const satisfies readonly { allowed: boolean; role: UserRole }[];

describe('medical-records global route guard', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(ROLE_ACCESS)('guards the global clinical list for $role', async ({ allowed, role }) => {
    mockUseCapabilities.mockReturnValue(capabilitiesForRoles([role]));
    const screen = await render(<MedicalRecordsRoute />);

    if (allowed) {
      expect(screen.queryByText('Sin permiso')).toBeNull();
      expect(screen.getByText('Historia clínica global')).toBeTruthy();
    } else {
      expect(screen.getByText('Sin permiso')).toBeTruthy();
      expect(screen.queryByText('Historia clínica global')).toBeNull();
    }
  });

  it('replaces protected content when the capability is lost in-session', async () => {
    mockUseCapabilities.mockReturnValue(capabilitiesForRoles(['admin']));
    const screen = await render(<MedicalRecordsRoute />);
    expect(screen.queryByText('Sin permiso')).toBeNull();

    mockUseCapabilities.mockReturnValue(capabilitiesForRoles(['shelter_manager']));
    screen.rerender(<MedicalRecordsRoute />);

    await waitFor(() => expect(screen.getByText('Sin permiso')).toBeTruthy());
  });
});
