import { fireEvent, render } from '@testing-library/react-native';

import { ClinicalHistory } from './ClinicalHistory';

import { useMedicalRecordsByAnimal } from '../hooks/useMedicalRecordsByAnimal';

jest.mock('../hooks/useMedicalRecordsByAnimal', () => ({
  useMedicalRecordsByAnimal: jest.fn(),
}));

jest.mock('@/components/patterns', () => {
  const actual = jest.requireActual('@/components/patterns');
  const React = jest.requireActual('react');
  const { Pressable, Text } = jest.requireActual('react-native');
  const RANGE_DATES: Record<string, string> = { Desde: '2026-09-01', Hasta: '2026-09-28' };
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

const mockUseMedicalRecordsByAnimal = useMedicalRecordsByAnimal as jest.Mock;

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: '0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14',
    animalId: ANIMAL_ID,
    veterinarianId: null,
    recordType: 'vaccination',
    title: 'Vacuna antirrábica',
    diagnosis: null,
    treatment: 'Dosis única',
    notes: null,
    occurredAt: '2026-09-22T14:30:00.000Z',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
    ...overrides,
  };
}

function createQueryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      items: [makeRecord()],
      page: 1,
      limit: 20,
      total: 1,
    },
    isError: false,
    isPending: false,
    isSuccess: true,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('ClinicalHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while fetching', async () => {
    mockUseMedicalRecordsByAnimal.mockReturnValue(
      createQueryResult({ data: undefined, isPending: true, isSuccess: false })
    );
    const screen = await render(<ClinicalHistory animalId={ANIMAL_ID} />);

    expect(screen.getByText('Cargando evolución clínica')).toBeTruthy();
  });

  it('shows an error state with retry', async () => {
    const refetch = jest.fn();
    mockUseMedicalRecordsByAnimal.mockReturnValue(
      createQueryResult({ data: undefined, isError: true, isSuccess: false, refetch })
    );
    const screen = await render(<ClinicalHistory animalId={ANIMAL_ID} />);

    expect(screen.getByText('No se pudo cargar la evolución clínica')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an empty state when there are no records', async () => {
    mockUseMedicalRecordsByAnimal.mockReturnValue(
      createQueryResult({ data: { items: [], page: 1, limit: 20, total: 0 } })
    );
    const screen = await render(<ClinicalHistory animalId={ANIMAL_ID} />);

    expect(screen.getByText('Sin evolución clínica')).toBeTruthy();
  });

  it('renders records with Spanish labels', async () => {
    mockUseMedicalRecordsByAnimal.mockReturnValue(createQueryResult());
    const screen = await render(<ClinicalHistory animalId={ANIMAL_ID} />);

    expect(screen.getAllByText('Vacunación')).toHaveLength(2);
    expect(screen.getByText('Vacuna antirrábica')).toBeTruthy();
    expect(screen.getByText('Dosis única')).toBeTruthy();
  });

  it('offers a chip for every backend record type', async () => {
    mockUseMedicalRecordsByAnimal.mockReturnValue(createQueryResult());
    const screen = await render(<ClinicalHistory animalId={ANIMAL_ID} />);

    for (const label of [
      'Consulta',
      'Vacunación',
      'Desparasitación',
      'Cirugía',
      'Resultado de laboratorio',
      'Tratamiento',
      'Otro',
    ]) {
      expect(screen.getByRole('button', { name: label })).toBeTruthy();
    }
  });

  it('filters by any record type', async () => {
    mockUseMedicalRecordsByAnimal.mockReturnValue(createQueryResult());
    const screen = await render(<ClinicalHistory animalId={ANIMAL_ID} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Cirugía' }));

    expect(mockUseMedicalRecordsByAnimal).toHaveBeenLastCalledWith(ANIMAL_ID, {
      recordType: 'surgery',
    });
  });

  it('applies a custom date range when both dates are set', async () => {
    mockUseMedicalRecordsByAnimal.mockReturnValue(createQueryResult());
    const screen = await render(<ClinicalHistory animalId={ANIMAL_ID} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Personalizado' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Desde' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Hasta' }));

    const filters = mockUseMedicalRecordsByAnimal.mock.calls.at(-1)?.[1];
    expect(filters.from).toMatch(/^2026-09-01T00:00:00/);
    expect(filters.to).toMatch(/^2026-09-28T23:59:00/);
  });

  it('shows a message and skips the range when only one custom date is set', async () => {
    mockUseMedicalRecordsByAnimal.mockReturnValue(createQueryResult());
    const screen = await render(<ClinicalHistory animalId={ANIMAL_ID} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Personalizado' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Desde' }));

    expect(screen.getByText('Definí las dos fechas del período.')).toBeTruthy();
    expect(mockUseMedicalRecordsByAnimal).toHaveBeenLastCalledWith(ANIMAL_ID, {});
  });

  it('renders records in the order returned by the server', async () => {
    mockUseMedicalRecordsByAnimal.mockReturnValue(
      createQueryResult({
        data: {
          items: [
            makeRecord({ id: 'rec-1', recordType: 'consultation', title: 'Primera consulta' }),
            makeRecord({ id: 'rec-2', title: 'Segunda vacuna' }),
          ],
          page: 1,
          limit: 20,
          total: 2,
        },
      })
    );
    const screen = await render(<ClinicalHistory animalId={ANIMAL_ID} />);

    const titles = screen.getAllByText(/Primera consulta|Segunda vacuna/);
    expect(titles.map((node) => node.props.children)).toEqual([
      'Primera consulta',
      'Segunda vacuna',
    ]);
  });

  it('invokes the edit callback with the record id', async () => {
    const onEditRecord = jest.fn();
    mockUseMedicalRecordsByAnimal.mockReturnValue(createQueryResult());
    const screen = await render(
      <ClinicalHistory animalId={ANIMAL_ID} onEditRecord={onEditRecord} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Editar Vacuna antirrábica' }));
    expect(onEditRecord).toHaveBeenCalledWith('0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14');
  });

  it('invokes the history callback with the record id', async () => {
    const onViewChanges = jest.fn();
    mockUseMedicalRecordsByAnimal.mockReturnValue(createQueryResult());
    const screen = await render(
      <ClinicalHistory animalId={ANIMAL_ID} onViewChanges={onViewChanges} />
    );

    expect(screen.getByTestId('clinical-record-history-button')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Ver historial de cambios de Vacuna antirrábica' })
    );
    expect(onViewChanges).toHaveBeenCalledWith('0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14');
  });
});
