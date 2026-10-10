import { render, waitFor } from '@testing-library/react-native';

import { capabilitiesForRoles, type UserRole } from '@/application/authorization';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { CreateVeterinarianScreen } from '@/features/veterinarians/components/CreateVeterinarianScreen';

import NewVeterinarianRoute from '../new';

jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountHeaderRow', () => ({ AccountHeaderRow: () => null }));
jest.mock('@/features/veterinarians/components/CreateVeterinarianScreen', () => ({
  CreateVeterinarianScreen: jest.fn(() => {
    const { Text } = jest.requireActual('react-native') as typeof import('react-native');
    return <Text>Formulario veterinario</Text>;
  }),
}));

const mockCapabilities = useCapabilities as jest.MockedFunction<typeof useCapabilities>;
const mockCreateScreen = CreateVeterinarianScreen as jest.Mock;

describe('NewVeterinarianRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCapabilities.mockReturnValue(capabilitiesForRoles(['admin']));
  });

  it.each(['admin', 'shelter_manager'] as const satisfies readonly UserRole[])(
    'delegates the allowed route to the feature screen for %s',
    async (role) => {
      mockCapabilities.mockReturnValue(capabilitiesForRoles([role]));
      const screen = await render(<NewVeterinarianRoute />);

      expect(screen.getByText('Formulario veterinario')).toBeTruthy();
      expect(mockCreateScreen).toHaveBeenCalledTimes(1);
    }
  );

  it('blocks the create route for veterinarians', async () => {
    mockCapabilities.mockReturnValue(capabilitiesForRoles(['veterinarian']));
    const screen = await render(<NewVeterinarianRoute />);

    expect(screen.getByText('Sin permiso')).toBeTruthy();
    expect(screen.queryByText('Formulario veterinario')).toBeNull();
  });

  it('does not mount the form when the capability is lost', async () => {
    const screen = await render(<NewVeterinarianRoute />);
    expect(screen.getByText('Formulario veterinario')).toBeTruthy();

    mockCapabilities.mockReturnValue(capabilitiesForRoles(['veterinarian']));
    screen.rerender(<NewVeterinarianRoute />);

    await waitFor(() => expect(screen.getByText('Sin permiso')).toBeTruthy());
    expect(screen.queryByText('Formulario veterinario')).toBeNull();
  });
});
