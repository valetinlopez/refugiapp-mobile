import { render } from '@testing-library/react-native';

import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { useLocalSearchParams } from 'expo-router';
import MedicalRecordChangesRoute from '../changes';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountHeaderRow', () => ({ AccountHeaderRow: () => null }));
jest.mock('@/components/navigation', () => ({ navigateBack: jest.fn() }));
jest.mock('@/features/medical-records/components/MedicalRecordChangesScreen', () => ({
  MedicalRecordChangesScreen: () => null,
}));

const mockUseCapabilities = useCapabilities as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

const RECORD_ID = '11111111-1111-4111-8111-111111111111';

describe('MedicalRecordChangesRoute', () => {
  it('explains restricted access for roles without clinical records permission', async () => {
    mockUseCapabilities.mockReturnValue({ canReadClinicalRecords: false });
    mockUseLocalSearchParams.mockReturnValue({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      recordId: RECORD_ID,
    });
    const screen = await render(<MedicalRecordChangesRoute />);

    expect(screen.getByText('Sin permiso')).toBeTruthy();
    expect(screen.getByText('Tu rol no habilita consultar el historial clínico.')).toBeTruthy();
  });

  it('shows an invalid state when the record id is not a UUID', async () => {
    mockUseCapabilities.mockReturnValue({ canReadClinicalRecords: true });
    mockUseLocalSearchParams.mockReturnValue({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      recordId: 'not-a-uuid',
    });
    const screen = await render(<MedicalRecordChangesRoute />);

    expect(screen.getByText('Registro inválido')).toBeTruthy();
  });

  it('renders the history screen for authorized roles', async () => {
    mockUseCapabilities.mockReturnValue({ canReadClinicalRecords: true });
    mockUseLocalSearchParams.mockReturnValue({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      recordId: RECORD_ID,
    });
    const screen = await render(<MedicalRecordChangesRoute />);

    expect(screen.queryByText('Sin permiso')).toBeNull();
    expect(screen.queryByText('Registro inválido')).toBeNull();
  });
});
