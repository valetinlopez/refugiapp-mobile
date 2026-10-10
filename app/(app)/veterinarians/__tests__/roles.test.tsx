import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { capabilitiesForRoles, type UserRole } from '@/application/authorization';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { VeterinarianDetail } from '@/features/veterinarians/components/VeterinarianDetail';
import { VeterinariansScreen } from '@/features/veterinarians/components/VeterinariansScreen';
import { useVeterinarian } from '@/features/veterinarians/hooks/useVeterinarian';
import {
  useDeactivateVeterinarian,
  useReactivateVeterinarian,
} from '@/features/veterinarians/hooks/useVeterinarianMutations';

import VeterinarianDetailRoute from '../[id]';
import VeterinariansRoute from '../index';

const VET_ID = '11111111-1111-4111-8111-111111111111';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: () => ({ id: VET_ID }),
}));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountHeaderRow', () => ({ AccountHeaderRow: () => null }));
jest.mock('@/components/navigation', () => ({ navigateBack: jest.fn() }));
jest.mock('@/features/veterinarians/hooks/useVeterinarian', () => ({
  useVeterinarian: jest.fn(),
}));
jest.mock('@/features/veterinarians/hooks/useVeterinarianMutations', () => ({
  useDeactivateVeterinarian: jest.fn(),
  useReactivateVeterinarian: jest.fn(),
}));
jest.mock('@/features/veterinarians/components/VeterinariansScreen', () => ({
  VeterinariansScreen: jest.fn(({ canWrite }: { canWrite: boolean }) => {
    const { Text } = jest.requireActual('react-native') as typeof import('react-native');
    return <Text>{canWrite ? 'Listado editable' : 'Listado de solo lectura'}</Text>;
  }),
}));
jest.mock('@/features/veterinarians/components/VeterinarianDetail', () => ({
  VeterinarianDetail: jest.fn(
    ({
      canWrite,
      confirmVisible,
      onConfirmDeactivate,
      onRequestDeactivate,
    }: {
      canWrite: boolean;
      confirmVisible: boolean;
      onConfirmDeactivate(): void;
      onRequestDeactivate(): void;
    }) => {
      const { Button, Text, View } = jest.requireActual(
        'react-native'
      ) as typeof import('react-native');
      return (
        <View>
          <Text>{canWrite ? 'Perfil editable' : 'Perfil de solo lectura'}</Text>
          <Text>{confirmVisible ? 'Confirmación abierta' : 'Confirmación cerrada'}</Text>
          <Button onPress={onRequestDeactivate} title="Solicitar desactivación" />
          <Button onPress={onConfirmDeactivate} title="Confirmar desactivación de prueba" />
        </View>
      );
    }
  ),
}));

const mockCapabilities = useCapabilities as jest.MockedFunction<typeof useCapabilities>;
const mockList = VeterinariansScreen as jest.Mock;
const mockDetail = VeterinarianDetail as jest.Mock;
const mockUseVeterinarian = useVeterinarian as jest.Mock;
const mockDeactivate = useDeactivateVeterinarian as jest.Mock;
const mockReactivate = useReactivateVeterinarian as jest.Mock;

const ROLE_ACCESS = [
  { canWrite: true, role: 'admin' },
  { canWrite: true, role: 'shelter_manager' },
  { canWrite: false, role: 'veterinarian' },
] as const satisfies readonly { canWrite: boolean; role: UserRole }[];

describe('veterinarian role certification', () => {
  const deactivateMutation = { error: null, isPending: false, mutate: jest.fn() };
  const reactivateMutation = { error: null, isPending: false, mutate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVeterinarian.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockDeactivate.mockReturnValue(deactivateMutation);
    mockReactivate.mockReturnValue(reactivateMutation);
  });

  it.each(ROLE_ACCESS)('configures list write actions for $role', async ({ canWrite, role }) => {
    mockCapabilities.mockReturnValue(capabilitiesForRoles([role]));
    const screen = await render(<VeterinariansRoute />);

    expect(
      screen.getByText(canWrite ? 'Listado editable' : 'Listado de solo lectura')
    ).toBeTruthy();
    expect(mockList).toHaveBeenLastCalledWith(expect.objectContaining({ canWrite }), undefined);
  });

  it.each(ROLE_ACCESS)('configures profile write actions for $role', async ({ canWrite, role }) => {
    mockCapabilities.mockReturnValue(capabilitiesForRoles([role]));
    const screen = await render(<VeterinarianDetailRoute />);

    expect(screen.getByText(canWrite ? 'Perfil editable' : 'Perfil de solo lectura')).toBeTruthy();
    expect(mockDetail).toHaveBeenLastCalledWith(expect.objectContaining({ canWrite }), undefined);
  });

  it('closes confirmation and blocks mutation when permission is lost in-session', async () => {
    mockCapabilities.mockReturnValue(capabilitiesForRoles(['admin']));
    const screen = await render(<VeterinarianDetailRoute />);

    await fireEvent.press(screen.getByRole('button', { name: 'Solicitar desactivación' }));
    expect(screen.getByText('Confirmación abierta')).toBeTruthy();

    mockCapabilities.mockReturnValue(capabilitiesForRoles(['veterinarian']));
    screen.rerender(<VeterinarianDetailRoute />);

    await waitFor(() => expect(screen.getByText('Confirmación cerrada')).toBeTruthy());
    await fireEvent.press(
      screen.getByRole('button', { name: 'Confirmar desactivación de prueba' })
    );
    expect(deactivateMutation.mutate).not.toHaveBeenCalled();
  });
});
