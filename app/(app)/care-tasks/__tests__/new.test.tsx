import { fireEvent, render } from '@testing-library/react-native';

import { useSession } from '@/features/auth/session';
import { useCareTaskAnimals } from '@/features/care-tasks/hooks/useCareTaskAnimals';
import { useCreateCareTask } from '@/features/care-tasks/hooks/useCreateCareTask';

import NewCareTaskScreen from '../new';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/features/auth/session', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/features/care-tasks/hooks/useCareTaskAnimals', () => ({
  useCareTaskAnimals: jest.fn(),
}));

jest.mock('@/features/care-tasks/hooks/useCreateCareTask', () => ({
  useCreateCareTask: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;
const mockUseCareTaskAnimals = useCareTaskAnimals as jest.Mock;
const mockUseCreateCareTask = useCreateCareTask as jest.Mock;

const { router } = jest.requireMock('expo-router') as {
  router: { back: jest.Mock; canGoBack: jest.Mock; replace: jest.Mock };
};

describe('NewCareTaskScreen navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCareTaskAnimals.mockReturnValue({ data: [] });
    mockUseCreateCareTask.mockReturnValue({ error: null, isPending: false, mutate: jest.fn() });
  });

  it('shows the persistent back header alongside the denied empty state', async () => {
    mockUseSession.mockReturnValue({ user: { roles: ['veterinarian'] } });
    const screen = await render(<NewCareTaskScreen />);

    expect(screen.getByText('Sin permiso')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Volver' })).toHaveLength(2);
  });

  it('falls back to the care tasks list when opened as a deep link', async () => {
    mockUseSession.mockReturnValue({ user: { roles: ['veterinarian'] } });
    router.canGoBack.mockReturnValue(false);
    const screen = await render(<NewCareTaskScreen />);

    const backButtons = screen.getAllByRole('button', { name: 'Volver' });
    if (backButtons[0]) {
      await fireEvent.press(backButtons[0]);
    }

    expect(router.replace).toHaveBeenCalledWith('/care-tasks');
    expect(router.back).not.toHaveBeenCalled();
  });
});
