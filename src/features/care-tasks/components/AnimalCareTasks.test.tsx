import { fireEvent, render } from '@testing-library/react-native';

import { useCancelCareTask, useCompleteCareTask } from '../hooks/useCareTaskActions';
import { useCareTasks } from '../hooks/useCareTasks';
import { AnimalCareTasks } from './AnimalCareTasks';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../hooks/useCareTasks', () => ({ useCareTasks: jest.fn() }));
jest.mock('../hooks/useCareTaskActions', () => ({
  useCancelCareTask: jest.fn(),
  useCompleteCareTask: jest.fn(),
}));

const mockUseCareTasks = useCareTasks as jest.Mock;
const mockUseCancelCareTask = useCancelCareTask as jest.Mock;
const mockUseCompleteCareTask = useCompleteCareTask as jest.Mock;

describe('AnimalCareTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCareTasks.mockReturnValue({ data: { items: [] }, isError: false, isPending: false });
    mockUseCancelCareTask.mockReturnValue({ mutate: jest.fn(), variables: undefined });
    mockUseCompleteCareTask.mockReturnValue({ mutate: jest.fn(), variables: undefined });
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
});
