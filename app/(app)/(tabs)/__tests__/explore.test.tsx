import { fireEvent, render } from '@testing-library/react-native';

import type { Animal } from '@/features/animals/types';

import { useAnimals } from '@/features/animals/hooks/useAnimals';
import { useSpecies } from '@/features/animals/hooks/useSpecies';

import { useSession } from '@/features/auth/session';

import ExploreScreen from '../explore';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('@/features/auth/session', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/features/animals/hooks/useAnimals', () => ({
  useAnimals: jest.fn(),
}));

jest.mock('@/features/animals/hooks/useSpecies', () => ({
  useSpecies: jest.fn(),
}));

const mockUseAnimals = useAnimals as jest.Mock;
const mockUseSpecies = useSpecies as jest.Mock;
const mockUseSession = useSession as jest.Mock;
const { router } = jest.requireMock('expo-router') as {
  router: { push: jest.Mock; replace: jest.Mock };
};

const SPECIES = [
  { id: 'species-dog', slug: 'dog', labelEs: 'Perro' },
  { id: 'species-cat', slug: 'cat', labelEs: 'Gato' },
];

function createAnimal(): Animal {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Luna',
    species: 'dog',
    breed: null,
    sex: 'female',
    status: 'admitted',
    intakeDate: '2026-01-10',
    birthDate: null,
    profilePhotoMediaId: null,
  };
}

function createQueryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: { pages: [{ items: [createAnimal()], page: 1, limit: 20, total: 1 }] },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isPending: false,
    isRefetching: false,
    isSuccess: true,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('ExploreScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ user: { roles: ['admin'] } });
    mockUseSpecies.mockReturnValue({ isSuccess: true, data: SPECIES });
    mockUseAnimals.mockReturnValue(createQueryResult());
  });

  it('shows a loading state while fetching', async () => {
    mockUseAnimals.mockReturnValue(
      createQueryResult({ data: undefined, isPending: true, isSuccess: false })
    );
    const screen = await render(<ExploreScreen />);

    expect(screen.getByText('Cargando animales')).toBeTruthy();
  });

  it('shows an error state with retry', async () => {
    const refetch = jest.fn();
    mockUseAnimals.mockReturnValue(
      createQueryResult({ data: undefined, isError: true, isSuccess: false, refetch })
    );
    const screen = await render(<ExploreScreen />);

    expect(screen.getByText('No se pudieron cargar los animales')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an empty state when there are no animals', async () => {
    mockUseAnimals.mockReturnValue(
      createQueryResult({ data: { pages: [{ items: [], page: 1, limit: 20, total: 0 }] } })
    );
    const screen = await render(<ExploreScreen />);

    expect(screen.getByText('Sin animales')).toBeTruthy();
  });

  it('lists animals and navigates to the detail on press', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    expect(screen.getByText('Luna')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: /Luna, dog/ }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/animals/[id]',
      params: { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
    });
  });

  it('offers the alta action to writer roles', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    expect(screen.getByRole('button', { name: 'Alta' })).toBeTruthy();
  });

  it('hides the alta action for a veterinarian', async () => {
    mockUseSession.mockReturnValue({ user: { roles: ['veterinarian'] } });
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    expect(screen.queryByRole('button', { name: 'Alta' })).toBeNull();
  });

  it('filters animals by species when a chip is selected', async () => {
    const screen = await render(<ExploreScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Gato' }));

    expect(mockUseAnimals).toHaveBeenLastCalledWith(expect.objectContaining({ species: 'cat' }));
  });

  it('resets the species filter with Todas', async () => {
    const screen = await render(<ExploreScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Gato' }));
    const toditas = screen.getAllByRole('button', { name: 'Todas' });
    await fireEvent.press(toditas[toditas.length - 1]!);

    expect(mockUseAnimals).toHaveBeenLastCalledWith({});
  });
});
