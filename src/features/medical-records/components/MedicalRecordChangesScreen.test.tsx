import { fireEvent, render } from '@testing-library/react-native';

import { ApiError } from '@/core/api';
import { useVeterinarianDirectory } from '@/application/veterinarians';

import { MedicalRecordChangesScreen } from './MedicalRecordChangesScreen';

import { useMedicalRecordChanges } from '../hooks/useMedicalRecordChanges';

jest.mock('../hooks/useMedicalRecordChanges', () => ({
  useMedicalRecordChanges: jest.fn(),
}));

jest.mock('@/application/veterinarians', () => {
  const actual = jest.requireActual('@/application/veterinarians');
  return { ...actual, useVeterinarianDirectory: jest.fn() };
});

jest.mock('@/components/patterns', () => {
  const actual = jest.requireActual('@/components/patterns');
  const React = jest.requireActual('react');
  const { Pressable, Text } = jest.requireActual('react-native');
  const RANGE_DATES: Record<string, string> = {
    'Fecha desde': '2026-09-01',
    'Fecha hasta': '2026-09-28',
  };
  function DateTimeFieldStub({
    accessibilityLabel,
    onChange,
  }: {
    accessibilityLabel: string;
    onChange(value: string): void;
  }) {
    const value = RANGE_DATES[accessibilityLabel] ?? '2026-09-01';
    return React.createElement(
      Pressable,
      {
        accessibilityLabel,
        accessibilityRole: 'button',
        onPress: () => onChange(value),
      },
      React.createElement(Text, null, accessibilityLabel)
    );
  }
  return { ...actual, DateTimeField: DateTimeFieldStub };
});

const mockUseMedicalRecordChanges = useMedicalRecordChanges as jest.Mock;
const mockUseVeterinarianDirectory = useVeterinarianDirectory as jest.Mock;

const RECORD_ID = '11111111-1111-4111-8111-111111111111';

const ACTOR_UUID = '33333333-3333-4333-8333-333333333333';
const VET_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa1';
const UNKNOWN_VET_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa9';

function makeChange(overrides: Record<string, unknown> = {}) {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    medicalRecordId: RECORD_ID,
    changedByUserId: ACTOR_UUID,
    changeType: 'update',
    changedFields: ['title', 'diagnosis'],
    previousValues: { title: 'Vacuna anterior', diagnosis: 'Prev' },
    changedAt: '2026-09-29T12:00:00.000Z',
    changedBy: null,
    changedByFallbackId: ACTOR_UUID,
    ...overrides,
  };
}

function createQueryResult(overrides: Record<string, unknown> = {}) {
  const entry = makeChange();
  return {
    data: {
      pages: [{ items: [entry], page: 1, limit: 20, total: 1 }],
    },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isPending: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('MedicalRecordChangesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVeterinarianDirectory.mockReturnValue({
      data: [{ id: VET_ID, name: 'Sofía Gómez', licenseNumber: 'MP 100' }],
      namesById: new Map([[VET_ID, 'Sofía Gómez']]),
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
  });

  it('shows a loading state while fetching', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(
      createQueryResult({ data: undefined, isPending: true })
    );
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getByText('Cargando historial de cambios')).toBeTruthy();
  });

  it('shows an error state with retry', async () => {
    const refetch = jest.fn();
    mockUseMedicalRecordChanges.mockReturnValue(
      createQueryResult({ data: undefined, isError: true, refetch })
    );
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getByText('No se pudo cargar el historial')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an empty state when there are no changes', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(
      createQueryResult({
        data: { pages: [{ items: [], page: 1, limit: 20, total: 0 }] },
      })
    );
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getByText('Sin cambios')).toBeTruthy();
  });

  it('renders a change with type, actor and field diffs', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(createQueryResult());
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getAllByText('Actualización').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(ACTOR_UUID)).toBeTruthy();
    expect(screen.getByText('Título')).toBeTruthy();
    expect(screen.getByText('Vacuna anterior')).toBeTruthy();
  });

  it('shows the changed-by display name when available', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(
      createQueryResult({
        data: {
          pages: [
            {
              items: [
                makeChange({
                  changedBy: { id: ACTOR_UUID, displayName: 'Dr. Ana Ruiz', initials: 'AR' },
                  changedByFallbackId: ACTOR_UUID,
                }),
              ],
              page: 1,
              limit: 20,
              total: 1,
            },
          ],
        },
      })
    );
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getByText('Dr. Ana Ruiz')).toBeTruthy();
    expect(screen.queryByText(ACTOR_UUID)).toBeNull();
  });

  it('renders the system label when actor and fallback are both null', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(
      createQueryResult({
        data: {
          pages: [
            {
              items: [makeChange({ changedBy: null, changedByFallbackId: null })],
              page: 1,
              limit: 20,
              total: 1,
            },
          ],
        },
      })
    );
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getAllByText('Usuario del sistema').length).toBeGreaterThanOrEqual(1);
  });

  it('applies a change type filter', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(createQueryResult());
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Eliminación' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar filtros' }));

    expect(mockUseMedicalRecordChanges).toHaveBeenLastCalledWith(RECORD_ID, {
      changeType: 'soft_delete',
    });
  });

  it('applies actor and date filters together', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(createQueryResult());
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    const actorInput = screen.getByLabelText('Usuario que realizó el cambio (UUID)');
    await fireEvent.changeText(actorInput, '33333333-3333-4333-8333-333333333333');
    await fireEvent.press(screen.getByRole('button', { name: 'Fecha desde' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Fecha hasta' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar filtros' }));

    const filters = mockUseMedicalRecordChanges.mock.calls.at(-1)?.[1];
    expect(filters.changedByUserId).toBe('33333333-3333-4333-8333-333333333333');
    expect(filters.from).toMatch(/^2026-09-01T00:00:00/);
    expect(filters.to).toMatch(/^2026-09-28T23:59:00/);
  });

  it('shows a range error and skips applying filters when only one date is set', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(createQueryResult());
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Fecha desde' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar filtros' }));

    expect(screen.getByText('Definí las dos fechas del período.')).toBeTruthy();
    expect(mockUseMedicalRecordChanges).toHaveBeenLastCalledWith(RECORD_ID, {});
  });

  it('clears all filters', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(createQueryResult());
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Actualización' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar filtros' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Limpiar' }));

    expect(mockUseMedicalRecordChanges).toHaveBeenLastCalledWith(RECORD_ID, {});
  });

  it('renders an end-of-list hint once pagination is exhausted', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(createQueryResult({ hasNextPage: false }));
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getByText('No hay más cambios')).toBeTruthy();
  });

  it('exposes deterministic selectors for the E2E flow (RFG-132)', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(createQueryResult({ hasNextPage: false }));
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getByTestId('history-filter-type-all')).toBeTruthy();
    expect(screen.getByTestId('history-filter-type-update')).toBeTruthy();
    expect(screen.getByTestId('history-filter-type-soft_delete')).toBeTruthy();
    expect(screen.getByTestId('history-filter-actor')).toBeTruthy();
    expect(screen.getByTestId('history-filter-apply')).toBeTruthy();
    expect(screen.getByTestId('history-filter-clear')).toBeTruthy();
    expect(screen.getByTestId('history-end-of-list')).toBeTruthy();
  });

  it('resolves a veterinarian name from the shared directory without a raw UUID (RFG-177)', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(
      createQueryResult({
        data: {
          pages: [
            {
              items: [
                makeChange({
                  changedFields: ['veterinarianId'],
                  previousValues: { veterinarianId: VET_ID },
                }),
              ],
              page: 1,
              limit: 20,
              total: 1,
            },
          ],
        },
      })
    );
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getAllByText('Veterinario').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Sofía Gómez')).toBeTruthy();
    expect(screen.queryByText(VET_ID)).toBeNull();
  });

  it('falls back explicitly when the previous veterinarian is unassigned or unavailable', async () => {
    mockUseMedicalRecordChanges.mockReturnValue(
      createQueryResult({
        data: {
          pages: [
            {
              items: [
                makeChange({
                  id: 'change-vet-null',
                  changedFields: ['veterinarianId'],
                  previousValues: { veterinarianId: null },
                }),
                makeChange({
                  id: 'change-vet-unknown',
                  changedFields: ['veterinarianId'],
                  previousValues: { veterinarianId: UNKNOWN_VET_ID },
                }),
              ],
              page: 1,
              limit: 20,
              total: 2,
            },
          ],
        },
      })
    );
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getByText('Sin veterinario asignado')).toBeTruthy();
    expect(screen.getByText('Veterinario no disponible')).toBeTruthy();
    expect(screen.queryByText(UNKNOWN_VET_ID)).toBeNull();
  });

  it('keeps veterinarian fallbacks when the directory is offline', async () => {
    mockUseVeterinarianDirectory.mockReturnValue({
      data: undefined,
      namesById: new Map(),
      isError: true,
      isPending: false,
      refetch: jest.fn(),
    });
    mockUseMedicalRecordChanges.mockReturnValue(
      createQueryResult({
        data: {
          pages: [
            {
              items: [
                makeChange({
                  changedFields: ['veterinarianId'],
                  previousValues: { veterinarianId: VET_ID },
                }),
              ],
              page: 1,
              limit: 20,
              total: 1,
            },
          ],
        },
      })
    );
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getByText('Veterinario no disponible')).toBeTruthy();
    expect(screen.queryByText(VET_ID)).toBeNull();
  });

  it('shows an offline state with retry for a transport failure', async () => {
    const changesRefetch = jest.fn();
    const directoryRefetch = jest.fn();
    mockUseVeterinarianDirectory.mockReturnValue({
      data: undefined,
      namesById: new Map(),
      isError: false,
      isPending: false,
      refetch: directoryRefetch,
    });
    mockUseMedicalRecordChanges.mockReturnValue(
      createQueryResult({
        data: undefined,
        isError: true,
        error: new ApiError({
          code: 'NETWORK_ERROR',
          message: 'No pudimos conectar con el servidor.',
          requestId: 'req-offline',
          status: 0,
        }),
        refetch: changesRefetch,
      })
    );
    const screen = await render(<MedicalRecordChangesScreen recordId={RECORD_ID} />);

    expect(screen.getByTestId('offline-state')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(changesRefetch).toHaveBeenCalled();
    expect(directoryRefetch).toHaveBeenCalled();
  });
});
