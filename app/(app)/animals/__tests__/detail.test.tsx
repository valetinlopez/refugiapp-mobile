import { fireEvent, render } from '@testing-library/react-native';

import { useSession } from '@/features/auth/session';
import { useAnimal } from '@/features/animals/hooks/useAnimal';
import { useAnimalPhoto } from '@/features/animals/hooks/useAnimalPhoto';
import { useChangeAnimalStatus } from '@/features/animals/hooks/useChangeAnimalStatus';

import AnimalDetailScreen from '../[id]';

jest.setTimeout(20000);

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: ANIMAL_ID }),
}));

jest.mock('@/features/auth/session', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/features/animals/hooks/useAnimal', () => ({
  useAnimal: jest.fn(),
}));

jest.mock('@/features/animals/hooks/useAnimalPhoto', () => ({
  useAnimalPhoto: jest.fn(),
}));

jest.mock('@/features/animals/hooks/useChangeAnimalStatus', () => ({
  useChangeAnimalStatus: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;
const mockUseAnimal = useAnimal as jest.Mock;
const mockUseAnimalPhoto = useAnimalPhoto as jest.Mock;
const mockUseChangeAnimalStatus = useChangeAnimalStatus as jest.Mock;

const { router } = jest.requireMock('expo-router') as {
  router: { back: jest.Mock; canGoBack: jest.Mock; replace: jest.Mock };
};

describe('AnimalDetailScreen navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ user: { roles: ['admin'] } });
    mockUseAnimal.mockReturnValue({ data: undefined, isError: false, isPending: false });
    mockUseAnimalPhoto.mockReturnValue({ data: undefined });
    mockUseChangeAnimalStatus.mockReturnValue({ error: null, isPending: false, mutate: jest.fn() });
  });

  it('keeps the persistent back header when the animal is not found', async () => {
    const screen = await render(<AnimalDetailScreen />);

    expect(screen.getByText('Animal no encontrado')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Volver' })).toHaveLength(2);
  });

  it('falls back to the explore list when opened as a deep link without history', async () => {
    router.canGoBack.mockReturnValue(false);
    const screen = await render(<AnimalDetailScreen />);

    const backButtons = screen.getAllByRole('button', { name: 'Volver' });
    if (backButtons[0]) {
      await fireEvent.press(backButtons[0]);
    }

    expect(router.replace).toHaveBeenCalledWith('/explore');
    expect(router.back).not.toHaveBeenCalled();
  });
});
