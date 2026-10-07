import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { capabilitiesForRoles, type RoleCapabilities } from '@/application/authorization';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import MoreTabScreen from '../more';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountScreen', () => {
  const { Pressable, Text, View } = jest.requireActual(
    'react-native'
  ) as typeof import('react-native');
  return {
    AccountScreen: ({
      management,
      notifications,
      onOpenProfile,
    }: {
      management: React.ReactNode;
      notifications: React.ReactNode;
      onOpenProfile(): void;
    }) => (
      <View>
        <Pressable accessibilityLabel="Abrir Mi perfil" onPress={onOpenProfile}>
          <Text>Perfil</Text>
        </Pressable>
        {management}
        {notifications}
      </View>
    ),
  };
});
jest.mock('@/features/notifications/components/NotificationsSection', () => ({
  NotificationsSection: () => {
    const { Text } = jest.requireActual('react-native') as typeof import('react-native');
    return <Text>Notificaciones existentes</Text>;
  },
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
    expect(screen.getByText('Notificaciones existentes')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Abrir Mi perfil'));
    expect(router.push).toHaveBeenCalledWith('/profile');

    await fireEvent.press(screen.getByRole('button', { name: 'Ver auditoría' }));
    expect(router.push).toHaveBeenCalledWith('/audit');
  });

  it.each(['shelter_manager', 'veterinarian'] as const)(
    'keeps profile and removes privileged destinations for %s',
    async (role) => {
      setCapabilities(capabilitiesForRoles([role]));
      const screen = await render(<MoreTabScreen />);

      expect(screen.getByLabelText('Abrir Mi perfil')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Veterinarios' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Usuarios' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Ver auditoría' })).toBeNull();
    }
  );

  it('removes privileged destinations when permissions are lost during the session', async () => {
    setCapabilities(capabilitiesForRoles(['admin']));
    const screen = await render(<MoreTabScreen />);

    expect(screen.getByRole('button', { name: 'Usuarios' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ver auditoría' })).toBeTruthy();

    setCapabilities(capabilitiesForRoles(['veterinarian']));
    screen.rerender(<MoreTabScreen />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Usuarios' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Ver auditoría' })).toBeNull();
    });
    expect(screen.getByRole('button', { name: 'Veterinarios' })).toBeTruthy();
  });
});
