import { fireEvent, render } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { useAnimalOption, useAnimalOptionPhoto } from '@/application/animals';
import { useVeterinarianDirectoryEntry } from '@/application/veterinarians';
import { navigateBack } from '@/components/navigation';
import { ApiError } from '@/core/api';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import { useClinicalAttachments } from '../hooks/useClinicalAttachments';
import { useDeleteMedicalRecord } from '../hooks/useDeleteMedicalRecord';
import { useMedicalRecord } from '../hooks/useMedicalRecord';
import type { MedicalRecord } from '../types';
import { MedicalRecordDetailScreen } from './MedicalRecordDetailScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/components/navigation', () => ({ navigateBack: jest.fn() }));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/application/animals', () => ({
  useAnimalOption: jest.fn(),
  useAnimalOptionPhoto: jest.fn(),
}));
jest.mock('@/application/veterinarians', () => ({
  useVeterinarianDirectoryEntry: jest.fn(),
}));
jest.mock('../hooks/useMedicalRecord', () => ({ useMedicalRecord: jest.fn() }));
jest.mock('../hooks/useClinicalAttachments', () => ({ useClinicalAttachments: jest.fn() }));
jest.mock('../hooks/useDeleteMedicalRecord', () => ({ useDeleteMedicalRecord: jest.fn() }));

const mockCapabilities = useCapabilities as jest.Mock;
const mockRecord = useMedicalRecord as jest.Mock;
const mockAnimal = useAnimalOption as jest.Mock;
const mockAnimalPhoto = useAnimalOptionPhoto as jest.Mock;
const mockVeterinarian = useVeterinarianDirectoryEntry as jest.Mock;
const mockAttachments = useClinicalAttachments as jest.Mock;
const mockDelete = useDeleteMedicalRecord as jest.Mock;
const mockNavigateBack = navigateBack as jest.Mock;

const RECORD_ID = '0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14';
const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const VET_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';

const record: MedicalRecord = {
  id: RECORD_ID,
  animalId: ANIMAL_ID,
  veterinarianId: VET_ID,
  recordType: 'consultation',
  title: 'Control general',
  diagnosis: 'Inflamación leve',
  treatment: 'Continuar medicación',
  notes: null,
  occurredAt: '2026-09-21T13:30:00.000Z',
  createdAt: '2026-09-21T14:05:00.000Z',
  updatedAt: '2026-09-21T14:05:00.000Z',
};

function query(data: unknown = undefined) {
  return {
    data,
    error: null,
    isError: false,
    isPending: false,
    refetch: jest.fn(),
  };
}

function networkError() {
  return new ApiError({
    code: 'NETWORK_ERROR',
    message: 'No pudimos conectar con el servidor.',
    requestId: 'req-1',
    status: 0,
  });
}

describe('MedicalRecordDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCapabilities.mockReturnValue({ canReadClinicalRecords: true });
    mockRecord.mockReturnValue(query(record));
    mockAnimal.mockReturnValue(query({ id: ANIMAL_ID, name: 'Luna' }));
    mockAnimalPhoto.mockReturnValue(query());
    mockVeterinarian.mockReturnValue(
      query({ id: VET_ID, name: 'Sofía Gómez', licenseNumber: 'MP 100' })
    );
    mockAttachments.mockReturnValue(
      query([
        {
          id: 'media-1',
          name: 'control.pdf',
          secureUrl: 'https://cdn.test/control.pdf',
          format: 'pdf',
          resourceType: 'raw',
          bytes: 1024,
        },
      ])
    );
    mockDelete.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutate: jest.fn(),
    });
  });

  it('renders an invalid-id state', async () => {
    const screen = await render(<MedicalRecordDetailScreen recordId="" />);

    expect(screen.getByText('Registro no encontrado')).toBeTruthy();
  });

  it('renders the loading state explicitly', async () => {
    mockRecord.mockReturnValue({ ...query(), isPending: true });
    const screen = await render(<MedicalRecordDetailScreen recordId={RECORD_ID} />);

    expect(screen.getByText('Cargando registro clínico')).toBeTruthy();
  });

  it('renders the offline state explicitly', async () => {
    mockRecord.mockReturnValue({ ...query(), error: networkError(), isError: true });
    const screen = await render(<MedicalRecordDetailScreen recordId={RECORD_ID} />);

    expect(screen.getByTestId('medical-record-detail-offline')).toBeTruthy();
  });

  it('opens only a validated HTTPS attachment URL', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const screen = await render(<MedicalRecordDetailScreen recordId={RECORD_ID} />);

    await fireEvent.press(screen.getByTestId('medical-record-attachment-media-1'));

    expect(openURL).toHaveBeenCalledWith('https://cdn.test/control.pdf');
    openURL.mockRestore();
  });

  it('navigates back only after the server confirms soft-delete', async () => {
    const mutate = jest.fn((_id: string, options: { onSuccess?: () => void }) => {
      options.onSuccess?.();
    });
    mockDelete.mockReturnValue({ error: null, isError: false, isPending: false, mutate });
    const screen = await render(<MedicalRecordDetailScreen recordId={RECORD_ID} />);

    await fireEvent.press(screen.getByTestId('medical-record-delete'));
    await fireEvent.press(screen.getByTestId('confirm-accept'));

    expect(mutate).toHaveBeenCalledWith(RECORD_ID, expect.anything());
    expect(mockNavigateBack).toHaveBeenCalledWith('/medical-records');
  });
});
