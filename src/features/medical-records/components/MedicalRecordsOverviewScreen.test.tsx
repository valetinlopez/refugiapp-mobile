import { fireEvent, render } from '@testing-library/react-native';

import { ApiError } from '@/core/api';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import { useAnimalOptionsWithFallback } from '@/application/animals';
import { useVeterinarianDirectory } from '@/application/veterinarians';

import { useInfiniteMedicalRecords } from '../hooks/useInfiniteMedicalRecords';
import type { MedicalRecord, PaginatedMedicalRecords } from '../types';
import { MedicalRecordsOverviewScreen } from './MedicalRecordsOverviewScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/core/network', () => {
  const actual = jest.requireActual('@/core/network');
  return { ...actual, useConnectivityStatus: () => true };
});
jest.mock('@/application/animals', () => {
  const actual = jest.requireActual('@/application/animals');
  return { ...actual, useAnimalOptionsWithFallback: jest.fn(), useAnimalOptionPhoto: jest.fn() };
});
jest.mock('@/application/veterinarians', () => {
  const actual = jest.requireActual('@/application/veterinarians');
  return { ...actual, useVeterinarianDirectory: jest.fn() };
});
jest.mock('../hooks/useInfiniteMedicalRecords', () => {
  const actual = jest.requireActual('../hooks/useInfiniteMedicalRecords');
  return { ...actual, useInfiniteMedicalRecords: jest.fn() };
});

const mockUseCapabilities = useCapabilities as jest.Mock;
const mockAnimalOptions = useAnimalOptionsWithFallback as jest.Mock;
const mockVeterinarianDirectory = useVeterinarianDirectory as jest.Mock;
const mockUseInfiniteMedicalRecords = useInfiniteMedicalRecords as jest.Mock;
const mockAnimalPhoto = jest.requireMock('@/application/animals').useAnimalOptionPhoto as jest.Mock;

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const OTHER_ANIMAL_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';
const VET_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa1';

function record(overrides: Partial<MedicalRecord> = {}): MedicalRecord {
  return {
    id: 'record-1',
    animalId: ANIMAL_ID,
    veterinarianId: VET_ID,
    recordType: 'consultation',
    title: 'Control general',
    diagnosis: null,
    treatment: null,
    notes: null,
    occurredAt: '2026-09-22T10:30:00.000Z',
    createdAt: '2026-09-22T10:30:00.000Z',
    updatedAt: '2026-09-22T10:30:00.000Z',
    ...overrides,
  };
}

function page(items: MedicalRecord[], total = items.length): PaginatedMedicalRecords {
  return { items, page: 1, limit: 20, total };
}

function queryResult(pages: PaginatedMedicalRecords[]) {
  return {
    data: { pages },
    error: null,
    hasNextPage: false,
    isError: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    isPending: false,
    isRefetching: false,
    refetch: jest.fn(),
  };
}

describe('MedicalRecordsOverviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCapabilities.mockReturnValue({ canReadClinicalRecords: true });
    mockAnimalOptions.mockReturnValue({
      data: [
        { id: ANIMAL_ID, name: 'Luna', profilePhotoMediaId: null },
        { id: OTHER_ANIMAL_ID, name: 'Toby', profilePhotoMediaId: null },
      ],
      errorMessage: null,
      isError: false,
      isFallback: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockVeterinarianDirectory.mockReturnValue({
      data: [{ id: VET_ID, name: 'Sofía Gómez', licenseNumber: 'MP 100' }],
      namesById: new Map([[VET_ID, 'Sofía Gómez']]),
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockAnimalPhoto.mockReturnValue({ data: undefined, isSuccess: false });
    mockUseInfiniteMedicalRecords.mockReturnValue(queryResult([page([record()])]));
  });

  it('resolves animal and veterinarian names best-effort and never a raw UUID', async () => {
    const screen = await render(<MedicalRecordsOverviewScreen />);

    expect(screen.getAllByText('Luna').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Consulta').length).toBeGreaterThan(0);
    expect(screen.getByText('Sofía Gómez')).toBeTruthy();
    expect(screen.queryByText(VET_ID)).toBeNull();
    expect(screen.queryByText(ANIMAL_ID)).toBeNull();
  });

  it('opens the clinical record detail from the whole card', async () => {
    const screen = await render(<MedicalRecordsOverviewScreen />);
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };

    await fireEvent.press(screen.getByTestId('clinical-overview-card'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/medical-records/[id]',
      params: { id: 'record-1' },
    });
  });

  it('falls back explicitly for an unassigned or unavailable veterinarian', async () => {
    mockUseInfiniteMedicalRecords.mockReturnValue(
      queryResult([
        page([
          record({ id: 'r1', veterinarianId: null }),
          record({ id: 'r2', veterinarianId: '7fa85f64-5717-4562-b3fc-2c963f66afa9' }),
        ]),
      ])
    );

    const screen = await render(<MedicalRecordsOverviewScreen />);

    expect(screen.getByText('Sin veterinario asignado')).toBeTruthy();
    expect(screen.getByText('Veterinario no disponible')).toBeTruthy();
  });

  it('renders an explicit empty state', async () => {
    mockUseInfiniteMedicalRecords.mockReturnValue(queryResult([page([], 0)]));

    const screen = await render(<MedicalRecordsOverviewScreen />);

    expect(screen.getByText('Sin historia clínica')).toBeTruthy();
  });

  it('renders a loading state while the first page is pending', async () => {
    mockUseInfiniteMedicalRecords.mockReturnValue({
      ...queryResult([]),
      data: undefined,
      isPending: true,
    });

    const screen = await render(<MedicalRecordsOverviewScreen />);

    expect(screen.getByText('Cargando historia clínica')).toBeTruthy();
  });

  it('renders a retryable server error state', async () => {
    mockUseInfiniteMedicalRecords.mockReturnValue({
      ...queryResult([]),
      data: undefined,
      error: new ApiError({
        code: 'HTTP_500',
        message: 'Ocurrió un error en el servidor. Intenta nuevamente.',
        requestId: 'req-1',
        status: 500,
      }),
      isError: true,
    });

    const screen = await render(<MedicalRecordsOverviewScreen />);

    expect(screen.getByText('No se pudo cargar la historia clínica')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  });

  it('distinguishes a transport failure with an offline state', async () => {
    mockUseInfiniteMedicalRecords.mockReturnValue({
      ...queryResult([]),
      data: undefined,
      error: new ApiError({
        code: 'NETWORK_ERROR',
        message: 'No pudimos conectar con el servidor.',
        requestId: 'req-1',
        status: 0,
      }),
      isError: true,
    });

    const screen = await render(<MedicalRecordsOverviewScreen />);

    expect(screen.getByText('Sin conexión')).toBeTruthy();
    expect(screen.getByTestId('offline-state')).toBeTruthy();
  });

  it('filters by type through the accessible sheet keeping server filters contract-only', async () => {
    const screen = await render(<MedicalRecordsOverviewScreen />);

    await fireEvent.press(screen.getByTestId('clinical-type-filter'));
    await fireEvent.press(screen.getByTestId('clinical-type-option-vaccination'));

    expect(mockUseInfiniteMedicalRecords).toHaveBeenLastCalledWith({ recordType: 'vaccination' });
    expect(screen.getByText('Vacunación')).toBeTruthy();
  });

  it('applies the animal filter on loaded pages and explains the behavior', async () => {
    mockUseInfiniteMedicalRecords.mockReturnValue(
      queryResult([
        page([
          record({ id: 'r1', animalId: ANIMAL_ID }),
          record({ id: 'r2', animalId: OTHER_ANIMAL_ID, title: 'Vacunación' }),
        ]),
      ])
    );

    const screen = await render(<MedicalRecordsOverviewScreen />);

    await fireEvent.press(screen.getByTestId('clinical-animal-filter'));
    await fireEvent.press(screen.getByTestId(`clinical-animal-option-${ANIMAL_ID}`));

    expect(screen.queryByText('Vacunación')).toBeNull();
    expect(screen.getByTestId('clinical-global-create')).toBeTruthy();
    expect(screen.getByText(/El filtro de animal se aplica/)).toBeTruthy();
    expect(mockUseInfiniteMedicalRecords).toHaveBeenLastCalledWith({});
  });

  it('navigates to the global create route carrying the selected animal', async () => {
    const screen = await render(
      <MedicalRecordsOverviewScreen initialAnimalId={ANIMAL_ID} initialAnimalName="Luna" />
    );
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };

    await fireEvent.press(screen.getByTestId('clinical-global-create'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/medical-records/new',
      params: { animalId: ANIMAL_ID },
    });
  });

  it('offers the global create action without a selected animal', async () => {
    const screen = await render(<MedicalRecordsOverviewScreen />);
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };

    const fab = screen.getByTestId('clinical-global-create');
    expect(fab).toBeTruthy();

    await fireEvent.press(fab);

    expect(router.push).toHaveBeenCalledWith({ pathname: '/medical-records/new', params: {} });
  });

  it('clears active filters back to the unfiltered list', async () => {
    const screen = await render(
      <MedicalRecordsOverviewScreen initialAnimalId={ANIMAL_ID} initialAnimalName="Luna" />
    );

    expect(screen.getByTestId('clinical-clear-filters')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('clinical-clear-filters'));

    expect(screen.queryByTestId('clinical-clear-filters')).toBeNull();
    expect(screen.getByText('Todos los animales')).toBeTruthy();
  });
});
