import { render } from '@testing-library/react-native';

import { capabilitiesForRoles, type UserRole } from '@/application/authorization';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { useVeterinarian } from '@/features/veterinarians/hooks/useVeterinarian';
import { useUpdateVeterinarian } from '@/features/veterinarians/hooks/useVeterinarianMutations';

import EditVeterinarianRoute from '../edit';

const VET_ID = '11111111-1111-4111-8111-111111111111';

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: VET_ID }) }));
jest.mock('@/components/navigation', () => ({ navigateBack: jest.fn() }));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountHeaderRow', () => ({ AccountHeaderRow: () => null }));
jest.mock('@/features/veterinarians/hooks/useVeterinarian', () => ({
  useVeterinarian: jest.fn(),
}));
jest.mock('@/features/veterinarians/hooks/useVeterinarianMutations', () => ({
  useUpdateVeterinarian: jest.fn(),
}));

const mockCapabilities = useCapabilities as jest.MockedFunction<typeof useCapabilities>;
const mockUseVeterinarian = useVeterinarian as jest.Mock;
const mockUpdate = useUpdateVeterinarian as jest.Mock;

const ROLE_ACCESS = [
  { canWrite: true, role: 'admin' },
  { canWrite: true, role: 'shelter_manager' },
  { canWrite: false, role: 'veterinarian' },
] as const satisfies readonly { canWrite: boolean; role: UserRole }[];

describe('EditVeterinarianRoute permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVeterinarian.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isPending: true,
      refetch: jest.fn(),
    });
    mockUpdate.mockReturnValue({ error: null, isPending: false, mutate: jest.fn() });
  });

  it.each(ROLE_ACCESS)('enables the protected query only for $role', async ({ canWrite, role }) => {
    mockCapabilities.mockReturnValue(capabilitiesForRoles([role]));
    const screen = await render(<EditVeterinarianRoute />);

    expect(mockUseVeterinarian).toHaveBeenCalledWith(VET_ID, canWrite);
    if (canWrite) {
      expect(screen.getByLabelText('Cargando veterinario')).toBeTruthy();
      expect(screen.queryByText('Sin permiso')).toBeNull();
    } else {
      expect(screen.getByText('Sin permiso')).toBeTruthy();
      expect(screen.queryByLabelText('Cargando veterinario')).toBeNull();
    }
  });
});
