import { fireEvent, render } from '@testing-library/react-native';

import { capabilitiesForRoles, type RoleCapabilities } from '@/application/authorization';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import MoreTabScreen from '../more';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountScreen', () => {
  const { View } = jest.requireActual('react-native') as typeof import('react-native');
  return {
    AccountScreen: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});
jest.mock('@/features/notifications/components/NotificationsSection', () => ({
  NotificationsSection: () => null,
}));

const mockUseCapabilities = useCapabilities as jest.MockedFunction<typeof useCapabilities>;
const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };

function setCapabilities(capabilities: RoleCapabilities) {
  mockUseCapabilities.mockReturnValue(capabilities);
}

describe('MoreTabScreen management navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows every authorized destination to admins and navigates from an accessible card', async () => {
    setCapabilities(capabilitiesForRoles(['admin']));
    const screen = await render(<MoreTabScreen />);

    expect(screen.getByRole('button', { name: 'Veterinarios' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Usuarios' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ver auditoría' })).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Ver auditoría' }));
    expect(router.push).toHaveBeenCalledWith('/audit');
  });

  it('removes privileged destinations when the session lacks their capabilities', async () => {
    setCapabilities(capabilitiesForRoles(['veterinarian']));
    const screen = await render(<MoreTabScreen />);

    expect(screen.getByRole('button', { name: 'Veterinarios' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Usuarios' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ver auditoría' })).toBeNull();
  });
});
