import { render } from '@testing-library/react-native';

import { capabilitiesForRoles, type UserRole } from '@/application/authorization';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import { useCreateMedicalRecord } from '../hooks/useCreateMedicalRecord';
import { useMedicalRecordAnimals } from '../hooks/useMedicalRecordAnimals';
import { useVeterinarianOptions } from '../hooks/useVeterinarianOptions';
import { CreateMedicalRecordScreen } from './CreateMedicalRecordScreen';

jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/core/network', () => {
  const actual = jest.requireActual('@/core/network');
  return { ...actual, useConnectivityStatus: () => true };
});
jest.mock('../hooks/useMedicalRecordAnimals', () => ({
  useMedicalRecordAnimals: jest.fn(),
}));
jest.mock('../hooks/useVeterinarianOptions', () => ({ useVeterinarianOptions: jest.fn() }));
jest.mock('../hooks/useCreateMedicalRecord', () => ({ useCreateMedicalRecord: jest.fn() }));
jest.mock('./MedicalRecordForm', () => ({
  MedicalRecordForm: ({ initialAnimalId }: { initialAnimalId?: string }) => {
    const { Text } = jest.requireActual('react-native') as typeof import('react-native');
    return <Text>{`form:${initialAnimalId ?? 'none'}`}</Text>;
  },
}));

const mockUseCapabilities = useCapabilities as jest.Mock;
const mockAnimals = useMedicalRecordAnimals as jest.Mock;
const mockVets = useVeterinarianOptions as jest.Mock;
const mockCreate = useCreateMedicalRecord as jest.Mock;

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function animalsState(overrides: Record<string, unknown> = {}) {
  return {
    data: [{ id: ANIMAL_ID, name: 'Luna' }],
    errorMessage: null,
    isError: false,
    isFallback: false,
    isPending: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('CreateMedicalRecordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCapabilities.mockReturnValue(capabilitiesForRoles(['veterinarian']));
    mockAnimals.mockReturnValue(animalsState());
    mockVets.mockReturnValue({
      data: [],
      refetch: jest.fn(),
      veterinariansStatus: 'ready',
    });
    mockCreate.mockReturnValue({
      cancelUpload: jest.fn(),
      error: null,
      isPending: false,
      mutate: jest.fn(),
      upload: null,
    });
  });

  it('renders the create form with the preset animal and the D26 header', async () => {
    const screen = await render(<CreateMedicalRecordScreen initialAnimalId={ANIMAL_ID} />);

    expect(screen.getByText('Nuevo registro clínico')).toBeTruthy();
    expect(screen.getByText('Historia clínica')).toBeTruthy();
    expect(screen.getByText(`form:${ANIMAL_ID}`)).toBeTruthy();
  });

  it('shows the restricted state without the clinical capability', async () => {
    mockUseCapabilities.mockReturnValue(capabilitiesForRoles(['shelter_manager'] as UserRole[]));
    const screen = await render(<CreateMedicalRecordScreen />);

    expect(screen.getByText('Sin permiso')).toBeTruthy();
    expect(screen.queryByText('Nuevo registro clínico')).toBeNull();
  });

  it('shows an empty state when there are no animals', async () => {
    mockAnimals.mockReturnValue(animalsState({ data: [] }));
    const screen = await render(<CreateMedicalRecordScreen />);

    expect(screen.getByText('No hay animales disponibles')).toBeTruthy();
  });

  it('shows a retryable error state when the animal list fails', async () => {
    const refetch = jest.fn();
    mockAnimals.mockReturnValue(
      animalsState({ data: undefined, errorMessage: 'Sin conexión.', isError: true, refetch })
    );
    const screen = await render(<CreateMedicalRecordScreen />);

    expect(screen.getByText('No se pudo preparar el formulario')).toBeTruthy();
  });
});
