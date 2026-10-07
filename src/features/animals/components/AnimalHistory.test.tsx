import { fireEvent, render } from '@testing-library/react-native';

import { ApiError } from '@/core/api/errors';

import { useAnimalHistory } from '../hooks/useAnimalHistory';
import type { PaginatedAnimalHistoryEvents } from '../types';
import { AnimalHistory } from './AnimalHistory';

jest.mock('../hooks/useAnimalHistory', () => ({
  ...jest.requireActual('../hooks/useAnimalHistory'),
  useAnimalHistory: jest.fn(),
}));

const mockUseAnimalHistory = useAnimalHistory as jest.Mock;
const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createPage(overrides: Partial<PaginatedAnimalHistoryEvents> = {}) {
  return {
    items: [
      {
        id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
        animalId: ANIMAL_ID,
        eventType: 'status_change' as const,
        description: 'Pasó a disponible para adopción.',
        occurredAt: '2026-09-21T14:30:00.000Z',
        createdByUserId: null,
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
    ...overrides,
  };
}

function createQueryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: { pages: [createPage()], pageParams: [1] },
    error: null,
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

describe('AnimalHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnimalHistory.mockReturnValue(createQueryResult());
  });

  it('renders real events as an accessible timeline', async () => {
    const screen = await render(<AnimalHistory animalId={ANIMAL_ID} />);

    expect(screen.getByTestId('animal-history-list')).toBeTruthy();
    expect(screen.getByText('Cambio de estado')).toBeTruthy();
    expect(screen.getByText('Pasó a disponible para adopción.')).toBeTruthy();
    expect(screen.getByLabelText(/Cambio de estado\. Pasó a disponible/)).toBeTruthy();
  });

  it('passes only the selected contract eventType to the query', async () => {
    const screen = await render(<AnimalHistory animalId={ANIMAL_ID} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Todos los eventos' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Cambio de estado' }));

    expect(mockUseAnimalHistory).toHaveBeenLastCalledWith(ANIMAL_ID, {
      eventType: 'status_change',
    });
    expect(
      screen.getByRole('button', { name: 'Cambio de estado' }).props.accessibilityState.expanded
    ).toBe(false);
  });

  it('loads the next page incrementally', async () => {
    const fetchNextPage = jest.fn();
    mockUseAnimalHistory.mockReturnValue(createQueryResult({ fetchNextPage, hasNextPage: true }));
    const screen = await render(<AnimalHistory animalId={ANIMAL_ID} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Cargar más eventos' }));

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('shows the create action only with write capability', async () => {
    const onCreateEvent = jest.fn();
    const screen = await render(
      <AnimalHistory animalId={ANIMAL_ID} canCreateEvent onCreateEvent={onCreateEvent} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Agregar evento' }));
    expect(onCreateEvent).toHaveBeenCalledTimes(1);

    await screen.rerender(<AnimalHistory animalId={ANIMAL_ID} />);
    expect(screen.queryByRole('button', { name: 'Agregar evento' })).toBeNull();
  });

  it('shows loading, empty, server error and offline retry states', async () => {
    const refetch = jest.fn();
    mockUseAnimalHistory.mockReturnValue(createQueryResult({ data: undefined, isPending: true }));
    const screen = await render(<AnimalHistory animalId={ANIMAL_ID} />);
    expect(screen.getByText('Cargando historial')).toBeTruthy();

    mockUseAnimalHistory.mockReturnValue(
      createQueryResult({ data: { pages: [createPage({ items: [], total: 0 })] } })
    );
    await screen.rerender(<AnimalHistory animalId={ANIMAL_ID} />);
    expect(screen.getByText('Sin historial')).toBeTruthy();

    mockUseAnimalHistory.mockReturnValue(
      createQueryResult({ data: undefined, error: new Error('boom'), isError: true, refetch })
    );
    await screen.rerender(<AnimalHistory animalId={ANIMAL_ID} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalledTimes(1);

    mockUseAnimalHistory.mockReturnValue(
      createQueryResult({
        data: undefined,
        error: new ApiError({
          code: 'NETWORK_ERROR',
          message: 'offline',
          requestId: 'request-id',
          status: 0,
        }),
        isError: true,
        refetch,
      })
    );
    await screen.rerender(<AnimalHistory animalId={ANIMAL_ID} />);
    expect(screen.getByText('Sin conexión')).toBeTruthy();
  });
});
