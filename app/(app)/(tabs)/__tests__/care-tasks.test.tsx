import { render } from '@testing-library/react-native';

import type { CareTask, PaginatedCareTasks } from '@/features/care-tasks/types';

import {
  useCancelCareTask,
  useCompleteCareTask,
} from '@/features/care-tasks/hooks/useCareTaskActions';
import { useCareTaskAnimals } from '@/features/care-tasks/hooks/useCareTaskAnimals';
import { useCareTasks } from '@/features/care-tasks/hooks/useCareTasks';
import { useSession } from '@/features/auth/session';

import CareTasksScreen from '../care-tasks';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/features/auth/session', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/features/care-tasks/hooks/useCareTasks', () => ({
  useCareTasks: jest.fn(),
}));

jest.mock('@/features/care-tasks/hooks/useCareTaskAnimals', () => ({
  useCareTaskAnimals: jest.fn(),
}));

jest.mock('@/features/care-tasks/hooks/useCareTaskActions', () => ({
  useCompleteCareTask: jest.fn(),
  useCancelCareTask: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;
const mockUseCareTasks = useCareTasks as jest.Mock;
const mockUseCareTaskAnimals = useCareTaskAnimals as jest.Mock;
const mockUseCompleteCareTask = useCompleteCareTask as jest.Mock;
const mockUseCancelCareTask = useCancelCareTask as jest.Mock;

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const FIRST_TASK_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';
const SECOND_TASK_ID = '9fa85f64-5717-4562-b3fc-2c963f66afa6';

function createTask(id: string): CareTask {
  return {
    id,
    animalId: ANIMAL_ID,
    title: 'Dar medicación',
    description: null,
    status: 'pending',
    dueAt: '2026-09-30T18:00:00.000Z',
    completedAt: null,
    createdByUserId: null,
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  };
}

function createTasksQueryResult(items: CareTask[]) {
  const data: PaginatedCareTasks = { items, page: 1, limit: 20, total: items.length };
  return {
    data,
    isError: false,
    isPending: false,
    isRefetching: false,
    refetch: jest.fn(),
  };
}

function createMutationResult(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    error: null,
    isError: false,
    isIdle: false,
    isPending: false,
    isSuccess: false,
    mutate: jest.fn(),
    variables: undefined,
    ...overrides,
  };
}

describe('CareTasksScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ user: { roles: ['admin'] } });
    mockUseCareTasks.mockReturnValue(
      createTasksQueryResult([createTask(FIRST_TASK_ID), createTask(SECOND_TASK_ID)])
    );
    mockUseCareTaskAnimals.mockReturnValue({ data: [{ id: ANIMAL_ID, name: 'Luna' }] });
    mockUseCompleteCareTask.mockReturnValue(createMutationResult());
    mockUseCancelCareTask.mockReturnValue(createMutationResult());
  });

  it('shows the create action and pending actions for writer roles', async () => {
    const screen = await render(<CareTasksScreen />);

    expect(screen.getByRole('button', { name: 'Nueva tarea' })).toBeTruthy();
    expect(screen.getAllByLabelText('Completar')).toHaveLength(2);
    expect(screen.getAllByLabelText('Cancelar tarea')).toHaveLength(2);
  });

  it('hides mutations and explains read-only access for a veterinarian', async () => {
    mockUseSession.mockReturnValue({ user: { roles: ['veterinarian'] } });
    const screen = await render(<CareTasksScreen />);

    expect(screen.queryByRole('button', { name: 'Nueva tarea' })).toBeNull();
    expect(
      screen.getByText(
        'Tu rol permite consultar tareas, pero no crearlas, completarlas ni cancelarlas.'
      )
    ).toBeTruthy();
    expect(screen.queryByLabelText('Completar')).toBeNull();
    expect(screen.queryByLabelText('Cancelar tarea')).toBeNull();
  });

  it('disables only the row being mutated, not the whole list', async () => {
    mockUseCompleteCareTask.mockReturnValue(
      createMutationResult({ isPending: true, variables: FIRST_TASK_ID })
    );
    const screen = await render(<CareTasksScreen />);

    const completeButtons = screen.getAllByLabelText('Completar');
    expect(completeButtons).toHaveLength(2);
    expect(completeButtons.map((button) => button.props.accessibilityState?.disabled)).toEqual([
      true,
      false,
    ]);
  });
});
