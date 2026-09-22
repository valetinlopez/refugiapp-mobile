import { fireEvent, render } from '@testing-library/react-native';

import { AnimalHistory } from './AnimalHistory';

import { useAnimalHistory } from '../hooks/useAnimalHistory';

jest.mock('../hooks/useAnimalHistory', () => ({
  useAnimalHistory: jest.fn(),
}));

const mockUseAnimalHistory = useAnimalHistory as jest.Mock;

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createQueryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      items: [
        {
          id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
          animalId: ANIMAL_ID,
          eventType: 'status_change',
          description: 'Pasó a disponible para adopción.',
          occurredAt: '2026-09-21T14:30:00.000Z',
          createdByUserId: null,
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

describe('AnimalHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while fetching', async () => {
    mockUseAnimalHistory.mockReturnValue(
      createQueryResult({ data: undefined, isPending: true, isSuccess: false })
    );
    const screen = await render(<AnimalHistory animalId={ANIMAL_ID} />);

    expect(screen.getByText('Cargando historial')).toBeTruthy();
  });

  it('shows an error state with retry', async () => {
    const refetch = jest.fn();
    mockUseAnimalHistory.mockReturnValue(
      createQueryResult({ data: undefined, isError: true, isSuccess: false, refetch })
    );
    const screen = await render(<AnimalHistory animalId={ANIMAL_ID} />);

    expect(screen.getByText('No se pudo cargar el historial')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an empty state when there are no events', async () => {
    mockUseAnimalHistory.mockReturnValue(
      createQueryResult({ data: { items: [], page: 1, limit: 20, total: 0 } })
    );
    const screen = await render(<AnimalHistory animalId={ANIMAL_ID} />);

    expect(screen.getByText('Sin historial')).toBeTruthy();
  });

  it('renders the history events with Spanish labels', async () => {
    mockUseAnimalHistory.mockReturnValue(createQueryResult());
    const screen = await render(<AnimalHistory animalId={ANIMAL_ID} />);

    expect(screen.getByText('Cambio de estado')).toBeTruthy();
    expect(screen.getByText('Pasó a disponible para adopción.')).toBeTruthy();
  });
});
