import { fireEvent, render } from '@testing-library/react-native';

import { ClinicalHistory } from './ClinicalHistory';

import { useMedicalRecordsByAnimal } from '../hooks/useMedicalRecordsByAnimal';

jest.mock('../hooks/useMedicalRecordsByAnimal', () => ({
  useMedicalRecordsByAnimal: jest.fn(),
}));

const mockUseMedicalRecordsByAnimal = useMedicalRecordsByAnimal as jest.Mock;

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createQueryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      items: [
        {
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
        },
      ],
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

    expect(screen.getByText('Vacunación')).toBeTruthy();
    expect(screen.getByText('Vacuna antirrábica')).toBeTruthy();
    expect(screen.getByText('Dosis única')).toBeTruthy();
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
});
