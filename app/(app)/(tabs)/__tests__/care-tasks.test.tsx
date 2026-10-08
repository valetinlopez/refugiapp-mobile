import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { ApiError } from '@/core/api/errors';
import { useSession } from '@/features/auth/session';
import { useCareTaskAnimals } from '@/features/care-tasks/hooks/useCareTaskAnimals';
import { useCareTaskCounts, useInfiniteCareTasks } from '@/features/care-tasks/hooks/useCareTasks';
import type { CareTask, PaginatedCareTasks } from '@/features/care-tasks/types';

import CareTasksRoute from '../care-tasks';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/features/auth/session', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/features/care-tasks/hooks/useCareTasks', () => ({
  ...jest.requireActual('@/features/care-tasks/hooks/useCareTasks'),
  useCareTaskCounts: jest.fn(),
  useInfiniteCareTasks: jest.fn(),
}));

jest.mock('@/features/care-tasks/hooks/useCareTaskAnimals', () => ({
  useCareTaskAnimals: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;
const mockUseCareTaskAnimals = useCareTaskAnimals as jest.Mock;
const mockUseCareTaskCounts = useCareTaskCounts as jest.Mock;
const mockUseInfiniteCareTasks = useInfiniteCareTasks as jest.Mock;
const mockPush = router.push as jest.Mock;

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const TASK_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';

function createTask(overrides: Partial<CareTask> = {}): CareTask {
  return {
    id: TASK_ID,
    animalId: ANIMAL_ID,
    title: 'Dar medicación',
    description: 'Una dosis',
    status: 'pending',
    dueAt: null,
    completedAt: null,
    createdByUserId: null,
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
    ...overrides,
  };
}

function createPage(items: CareTask[] = [createTask()]): PaginatedCareTasks {
  return { items, page: 1, limit: 20, total: items.length };
}

function createTasksQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: { pages: [createPage()], pageParams: [1] },
    error: null,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isError: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    isPending: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('CareTasksRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ user: { roles: ['admin'] } });
    mockUseCareTaskAnimals.mockReturnValue({
      data: [{ id: ANIMAL_ID, name: 'Luna' }],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockUseCareTaskCounts.mockReturnValue({
      counts: { pending: 7, completed: 18, cancelled: 3 },
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockUseInfiniteCareTasks.mockReturnValue(createTasksQuery());
  });

  it('shows counters, the animal filter and the create action for writer roles', async () => {
    const screen = await render(<CareTasksRoute />);

    expect(screen.getByText('7 tareas pendientes')).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Pendientes 7' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Completadas 18' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Todos los animales' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nueva tarea' })).toBeTruthy();
  });

  it('changes the persisted status filter without inventing a presentation status', async () => {
    const screen = await render(<CareTasksRoute />);

    await fireEvent.press(screen.getByRole('radio', { name: 'Completadas 18' }));

    expect(mockUseInfiniteCareTasks).toHaveBeenLastCalledWith({ status: 'completed' });
  });

  it('shares the selected animal between the list and all counters', async () => {
    const screen = await render(<CareTasksRoute />);

    await fireEvent.press(screen.getByRole('button', { name: 'Todos los animales' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Luna' }));

    expect(mockUseCareTaskCounts).toHaveBeenLastCalledWith(ANIMAL_ID);
    expect(mockUseInfiniteCareTasks).toHaveBeenLastCalledWith({
      animalId: ANIMAL_ID,
      status: 'pending',
    });
  });

  it('opens the task detail from the compact overview card', async () => {
    const screen = await render(<CareTasksRoute />);

    await fireEvent.press(screen.getByRole('button', { name: /Luna, Dar medicación/ }));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/care-tasks/[id]',
      params: { id: TASK_ID },
    });
  });

  it('keeps the list infinite and prevents concurrent page requests', async () => {
    const fetchNextPage = jest.fn();
    mockUseInfiniteCareTasks.mockReturnValue(
      createTasksQuery({ fetchNextPage, hasNextPage: true })
    );
    const screen = await render(<CareTasksRoute />);

    await fireEvent.press(screen.getByRole('button', { name: 'Cargar más tareas' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    mockUseInfiniteCareTasks.mockReturnValue(
      createTasksQuery({ fetchNextPage, hasNextPage: true, isFetchingNextPage: true })
    );
    await screen.rerender(<CareTasksRoute />);
    fireEvent(screen.getByTestId('task-list'), 'endReached');
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('hides creation and explains read-only access for veterinarians', async () => {
    mockUseSession.mockReturnValue({ user: { roles: ['veterinarian'] } });
    const screen = await render(<CareTasksRoute />);

    expect(screen.queryByRole('button', { name: 'Nueva tarea' })).toBeNull();
    expect(
      screen.getByText(
        'Tu rol permite consultar tareas. La creación y los cambios están restringidos.'
      )
    ).toBeTruthy();
  });

  it('distinguishes loading, empty, server error and offline retry states', async () => {
    const refetch = jest.fn();
    mockUseInfiniteCareTasks.mockReturnValue(
      createTasksQuery({ data: undefined, isPending: true })
    );
    const screen = await render(<CareTasksRoute />);
    expect(screen.getByText('Cargando tareas')).toBeTruthy();

    mockUseInfiniteCareTasks.mockReturnValue(
      createTasksQuery({ data: { pages: [createPage([])], pageParams: [1] } })
    );
    await screen.rerender(<CareTasksRoute />);
    expect(screen.getByText('Sin tareas')).toBeTruthy();

    mockUseInfiniteCareTasks.mockReturnValue(
      createTasksQuery({ data: undefined, error: new Error('boom'), isError: true, refetch })
    );
    await screen.rerender(<CareTasksRoute />);
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalledTimes(1);

    mockUseInfiniteCareTasks.mockReturnValue(
      createTasksQuery({
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
    await screen.rerender(<CareTasksRoute />);
    expect(screen.getByText('Sin conexión')).toBeTruthy();
  });
});
