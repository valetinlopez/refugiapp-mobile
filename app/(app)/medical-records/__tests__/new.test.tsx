import { render } from '@testing-library/react-native';

import { capabilitiesForRoles } from '@/application/authorization';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import NewMedicalRecordRoute from '../new';

jest.mock('expo-router', () => ({ useLocalSearchParams: jest.fn(() => ({})) }));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountHeaderRow', () => ({ AccountHeaderRow: () => null }));
jest.mock('@/components/navigation', () => ({ navigateBack: jest.fn() }));
jest.mock('@/features/medical-records/components/CreateMedicalRecordScreen', () => ({
  CreateMedicalRecordScreen: ({ initialAnimalId }: { initialAnimalId?: string }) => {
    const { Text } = jest.requireActual('react-native') as typeof import('react-native');
    return <Text>{`create:${initialAnimalId ?? 'none'}`}</Text>;
  },
}));

const mockUseCapabilities = useCapabilities as jest.MockedFunction<typeof useCapabilities>;
const mockUseLocalSearchParams = jest.requireMock('expo-router').useLocalSearchParams as jest.Mock;

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('medical-records/new route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({});
  });

  it('guards the global create route for shelter_manager', async () => {
    mockUseCapabilities.mockReturnValue(capabilitiesForRoles(['shelter_manager']));
    const screen = await render(<NewMedicalRecordRoute />);

    expect(screen.getByText('Sin permiso')).toBeTruthy();
    expect(screen.queryByText(/create:/)).toBeNull();
  });

  it('preselects a valid animalId from the params', async () => {
    mockUseCapabilities.mockReturnValue(capabilitiesForRoles(['veterinarian']));
    mockUseLocalSearchParams.mockReturnValue({ animalId: ANIMAL_ID });
    const screen = await render(<NewMedicalRecordRoute />);

    expect(screen.getByText(`create:${ANIMAL_ID}`)).toBeTruthy();
  });

  it('ignores an invalid animalId', async () => {
    mockUseCapabilities.mockReturnValue(capabilitiesForRoles(['veterinarian']));
    mockUseLocalSearchParams.mockReturnValue({ animalId: 'not-a-uuid' });
    const screen = await render(<NewMedicalRecordRoute />);

    expect(screen.getByText('create:none')).toBeTruthy();
  });
});
