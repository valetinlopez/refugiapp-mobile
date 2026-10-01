import { fireEvent, render } from '@testing-library/react-native';

import { ApiError } from '@/core/api';
import { useMutationRetryQueue } from '@/core/network';

import { useCancelCareTask, useCompleteCareTask } from '../hooks/useCareTaskActions';
import { useCareTasks } from '../hooks/useCareTasks';
import { AnimalCareTasks } from './AnimalCareTasks';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../hooks/useCareTasks', () => ({ useCareTasks: jest.fn() }));
jest.mock('../hooks/useCareTaskActions', () => ({
  useCancelCareTask: jest.fn(),
  useCompleteCareTask: jest.fn(),
}));
jest.mock('@/core/network', () => ({
  ...jest.requireActual('@/core/network'),
  useMutationRetryQueue: jest.fn(),
}));

const mockUseCareTasks = useCareTasks as jest.Mock;
const mockUseCancelCareTask = useCancelCareTask as jest.Mock;
const mockUseCompleteCareTask = useCompleteCareTask as jest.Mock;
const mockUseMutationRetryQueue = useMutationRetryQueue as jest.Mock;

describe('AnimalCareTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCareTasks.mockReturnValue({ data: { items: [] }, isError: false, isPending: false });
    mockUseCancelCareTask.mockReturnValue({ mutate: jest.fn(), variables: undefined });
    mockUseCompleteCareTask.mockReturnValue({ mutate: jest.fn(), variables: undefined });
    mockUseMutationRetryQueue.mockReturnValue({
      enqueue: jest.fn(),
      flush: jest.fn(),
      pendingCount: 0,
      queue: undefined,
    });
  });

  it('offers contextual creation from the empty state to write roles', async () => {
    const screen = await render(<AnimalCareTasks animalId="animal-1" animalName="Luna" canWrite />);
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };

    await fireEvent.press(screen.getByRole('button', { name: 'Nueva tarea' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/care-tasks/new',
      params: { animalId: 'animal-1' },
    });
    expect(screen.getByText('Sin tareas')).toBeTruthy();
  });

  it('keeps veterinarian access read-only without an action that would return 403', async () => {
    const screen = await render(
      <AnimalCareTasks animalId="animal-1" animalName="Luna" canWrite={false} />
    );

    expect(screen.queryByRole('button', { name: 'Nueva tarea' })).toBeNull();
    expect(screen.getByText(/consultar estas tareas/)).toBeTruthy();
  });

  it('shows an offline state with retry when the network is unavailable', async () => {
    const refetch = jest.fn();
    mockUseCareTasks.mockReturnValue({
      error: new ApiError({
        code: 'NETWORK_ERROR',
        message: 'No pudimos conectar con el servicio. Revisá tu conexión.',
        requestId: 'request-id',
        status: 0,
      }),
      isError: true,
      isPending: false,
      refetch,
    });
    const screen = await render(<AnimalCareTasks animalId="animal-1" animalName="Luna" canWrite />);

    expect(screen.getByTestId('offline-state')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('announces offline changes pending delivery', async () => {
    mockUseMutationRetryQueue.mockReturnValue({
      enqueue: jest.fn(),
      flush: jest.fn(),
      pendingCount: 2,
      queue: undefined,
    });
    const screen = await render(<AnimalCareTasks animalId="animal-1" animalName="Luna" canWrite />);

    expect(screen.getByTestId('care-tasks-pending')).toBeTruthy();
    expect(screen.getByText(/Cambios pendientes de envío: 2/)).toBeTruthy();
  });
});
