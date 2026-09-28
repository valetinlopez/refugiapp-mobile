import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { Animal } from '@/features/animals/types';

import { useAnimals } from '@/features/animals/hooks/useAnimals';

import { useAnimalPhoto } from '@/features/animals/hooks/useAnimalPhoto';

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

jest.mock('@/features/animals/hooks/useAnimalPhoto', () => ({
  useAnimalPhoto: jest.fn(),
}));

const mockUseAnimals = useAnimals as jest.Mock;
const mockUseSession = useSession as jest.Mock;
const mockUseAnimalPhoto = useAnimalPhoto as jest.Mock;
const { router } = jest.requireMock('expo-router') as {
  router: { push: jest.Mock; replace: jest.Mock };
};

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
    isFetchNextPageError: false,
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
    mockUseAnimalPhoto.mockReturnValue({ data: undefined, isError: false, isPending: false });
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

  it('loads the next page once when the end is reached', async () => {
    const fetchNextPage = jest.fn();
    mockUseAnimals.mockReturnValue(
      createQueryResult({ fetchNextPage, hasNextPage: true, isFetchingNextPage: false })
    );
    const screen = await render(<ExploreScreen />);

    fireEvent(screen.getByTestId('animals-list'), 'endReached');

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('does not request another page while one is already loading', async () => {
    const fetchNextPage = jest.fn();
    mockUseAnimals.mockReturnValue(
      createQueryResult({ fetchNextPage, hasNextPage: true, isFetchingNextPage: true })
    );
    const screen = await render(<ExploreScreen />);

    fireEvent(screen.getByTestId('animals-list'), 'endReached');

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('retries a failed incremental page', async () => {
    const fetchNextPage = jest.fn();
    mockUseAnimals.mockReturnValue(
      createQueryResult({ fetchNextPage, isFetchNextPageError: true })
    );
    const screen = await render(<ExploreScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Reintentar carga' }));

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('refreshes the list with pull-to-refresh', async () => {
    const refetch = jest.fn();
    mockUseAnimals.mockReturnValue(createQueryResult({ refetch }));
    const screen = await render(<ExploreScreen />);

    fireEvent(screen.getByTestId('animals-list'), 'refresh');

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('requests the profile photo for each card with a profilePhotoMediaId', async () => {
    mockUseAnimals.mockReturnValue(
      createQueryResult({
        data: {
          pages: [
            {
              items: [
                createAnimal(),
                { ...createAnimal(), id: '9fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Simba' },
              ],
              page: 1,
              limit: 20,
              total: 2,
            },
          ],
        },
      })
    );
    await render(<ExploreScreen />);

    expect(mockUseAnimalPhoto).toHaveBeenCalledWith(null);
  });

  it('requests the profile photo with the media id when the animal has one', async () => {
    const mediaId = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';
    mockUseAnimals.mockReturnValue(
      createQueryResult({
        data: {
          pages: [
            {
              items: [{ ...createAnimal(), profilePhotoMediaId: mediaId }],
              page: 1,
              limit: 20,
              total: 1,
            },
          ],
        },
      })
    );
    await render(<ExploreScreen />);

    expect(mockUseAnimalPhoto).toHaveBeenCalledWith(mediaId);
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

  it('debounces name search by 400ms', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    fireEvent.changeText(screen.getByLabelText('Buscar animal'), '  Luna  ');

    expect(mockUseAnimals).toHaveBeenLastCalledWith({});

    await waitFor(() => {
      expect(mockUseAnimals).toHaveBeenLastCalledWith({ name: 'Luna' });
    });
  });

  it('combines status, species and sex filters', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Disponible para adopción' }));
    fireEvent.press(screen.getByRole('button', { name: 'Hembra' }));
    fireEvent.changeText(screen.getByLabelText('Filtrar por especie'), '  dog  ');

    await waitFor(() => {
      expect(mockUseAnimals).toHaveBeenLastCalledWith({
        status: 'available_for_adoption',
        sex: 'female',
        species: 'dog',
      });
    });
  });
});
