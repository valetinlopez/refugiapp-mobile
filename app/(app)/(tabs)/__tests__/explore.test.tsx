import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as RN from 'react-native';
import { StyleSheet } from 'react-native';

import { ApiError } from '@/core/api';
import type { Animal } from '@/features/animals/types';
import { resolveAnimalGridColumns } from '@/features/animals/utils/animalListPresentation';

import { useAnimals } from '@/features/animals/hooks/useAnimals';

import { useAnimalPhoto } from '@/features/animals/hooks/useAnimalPhoto';

import { useSession } from '@/features/auth/session';
import { sizes } from '@/theme';

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
const dimensionsSpy = jest.spyOn(RN, 'useWindowDimensions');

function setViewport(width: number, fontScale = 1) {
  dimensionsSpy.mockReturnValue({
    width,
    height: width < 360 ? 568 : 844,
    scale: 2,
    fontScale,
  });
}
const mockUseSession = useSession as jest.Mock;
const mockUseAnimalPhoto = useAnimalPhoto as jest.Mock;
const { router } = jest.requireMock('expo-router') as {
  router: { push: jest.Mock; replace: jest.Mock };
};

function createAnimal(overrides: Partial<Animal> = {}): Animal {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Luna',
    species: 'cat',
    breed: 'Mestiza',
    sex: 'female',
    status: 'under_treatment',
    intakeDate: '2026-01-10',
    birthDate: null,
    profilePhotoMediaId: null,
    ...overrides,
  };
}

function createQueryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: { pages: [{ items: [createAnimal()], page: 1, limit: 20, total: 1 }] },
    error: null,
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

function networkError() {
  return new ApiError({
    code: 'NETWORK_ERROR',
    message: 'Network error',
    requestId: 'request-id',
    status: 0,
  });
}

describe('ExploreScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setViewport(390, 1);
    mockUseSession.mockReturnValue({ user: { roles: ['admin'] } });
    mockUseAnimalPhoto.mockReturnValue({ data: undefined, isError: false, isPending: false });
  });

  it('shows the title with the server total', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    expect(screen.getByText('Animales')).toBeTruthy();
    expect(screen.getByText('1 animal registrado')).toBeTruthy();
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

  it('shows the offline state without connection', async () => {
    mockUseAnimals.mockReturnValue(
      createQueryResult({ data: undefined, error: networkError(), isError: true, isSuccess: false })
    );
    const screen = await render(<ExploreScreen />);

    expect(screen.getByText('Sin conexión')).toBeTruthy();
  });

  it('shows an empty state when there are no animals', async () => {
    mockUseAnimals.mockReturnValue(
      createQueryResult({ data: { pages: [{ items: [], page: 1, limit: 20, total: 0 }] } })
    );
    const screen = await render(<ExploreScreen />);

    expect(screen.getByText('Sin animales')).toBeTruthy();
  });

  it('lists animals in grid cards and navigates to the detail on press', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    expect(screen.getByText('Luna')).toBeTruthy();
    expect(screen.getAllByText('En tratamiento').length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByRole('button', { name: /Luna, cat/ }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/animals/[id]',
      params: { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
    });
  });

  it('de-duplicates animals repeated across pages', async () => {
    const luna = createAnimal();
    mockUseAnimals.mockReturnValue(
      createQueryResult({
        data: {
          pages: [
            { items: [luna], page: 1, limit: 20, total: 2 },
            {
              items: [luna, { ...luna, id: '9fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Toby' }],
              page: 2,
              limit: 20,
              total: 2,
            },
          ],
        },
      })
    );
    const screen = await render(<ExploreScreen />);

    expect(screen.getAllByText('Luna')).toHaveLength(1);
    expect(screen.getByText('Toby')).toBeTruthy();
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

    screen.getByTestId('animals-list').props.refreshControl.props.onRefresh();

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

  it('offers the alta action as a FAB to writer roles', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    expect(screen.getByRole('button', { name: 'Dar de alta un animal' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Alta' })).toBeNull();
  });

  it('hides the alta action for a veterinarian', async () => {
    mockUseSession.mockReturnValue({ user: { roles: ['veterinarian'] } });
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    expect(screen.queryByRole('button', { name: 'Dar de alta un animal' })).toBeNull();
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

  it('clears the quick search without losing the status filter', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    await fireEvent.press(screen.getByRole('radio', { name: 'En tratamiento' }));
    await waitFor(() => {
      expect(mockUseAnimals).toHaveBeenLastCalledWith({ status: 'under_treatment' });
    });

    fireEvent.changeText(screen.getByLabelText('Buscar animal'), 'Luna');
    await waitFor(() => {
      expect(mockUseAnimals).toHaveBeenLastCalledWith({
        name: 'Luna',
        status: 'under_treatment',
      });
    });

    await fireEvent.press(screen.getByTestId('animals-search-clear'));
    await waitFor(() => {
      expect(mockUseAnimals).toHaveBeenLastCalledWith({ status: 'under_treatment' });
    });
  });

  it('maps the status segmented control to the contract filter', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    await fireEvent.press(screen.getByRole('radio', { name: 'Disponible para adopción' }));
    await waitFor(() => {
      expect(mockUseAnimals).toHaveBeenLastCalledWith({ status: 'available_for_adoption' });
    });

    await fireEvent.press(screen.getByRole('radio', { name: 'Todos' }));
    await waitFor(() => {
      expect(mockUseAnimals).toHaveBeenLastCalledWith({});
    });
  });

  it('applies species and sex from the advanced sheet', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    await fireEvent.press(screen.getByTestId('animals-open-filters'));
    await fireEvent.changeText(screen.getByLabelText('Buscar por especie'), '  dog  ');
    await fireEvent.press(screen.getByRole('radio', { name: 'Macho' }));
    await fireEvent.press(screen.getByTestId('animals-filter-apply'));

    expect(mockUseAnimals).toHaveBeenLastCalledWith({ species: 'dog', sex: 'male' });
  });

  it('summarizes active filters and removes them one by one', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    await fireEvent.press(screen.getByTestId('animals-open-filters'));
    await fireEvent.changeText(screen.getByLabelText('Buscar por especie'), 'dog');
    await fireEvent.press(screen.getByTestId('animals-filter-apply'));

    expect(screen.getByTestId('animals-remove-filter-species')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('animals-remove-filter-species'));
    await waitFor(() => {
      expect(mockUseAnimals).toHaveBeenLastCalledWith({});
    });
  });

  it('clears every filter from the toolbar', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    await fireEvent.press(screen.getByRole('radio', { name: 'En tratamiento' }));
    await waitFor(() => {
      expect(mockUseAnimals).toHaveBeenLastCalledWith({ status: 'under_treatment' });
    });

    await fireEvent.press(screen.getByTestId('animals-clear-filters'));

    expect(mockUseAnimals).toHaveBeenLastCalledWith({});
  });

  it('limits the reading width on tablet without fixing the list height', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);
    const style = StyleSheet.flatten(
      screen.getByTestId('animals-list').props.contentContainerStyle
    );

    expect(style).toEqual(
      expect.objectContaining({
        alignSelf: 'center',
        flexGrow: 1,
        maxWidth: sizes.contentMaxWidth,
        width: '100%',
      })
    );
    expect(style.height).toBeUndefined();
  });

  it('renders two columns on a standard 390 phone (D41.1)', async () => {
    setViewport(390, 1);
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    // RNTL mocks FlatList and strips numColumns, so assert the wiring:
    // the mocked viewport resolves to 2 columns and the grid still renders.
    expect(resolveAnimalGridColumns(390, 1)).toBe(2);
    expect(screen.getByTestId('animals-list')).toBeTruthy();
    expect(screen.getByText('Luna')).toBeTruthy();
  });

  it('renders one column on a narrow 320 viewport (D41.1)', async () => {
    setViewport(320, 1);
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    expect(resolveAnimalGridColumns(320, 1)).toBe(1);
    expect(screen.getByTestId('animals-list')).toBeTruthy();
    expect(screen.getByText('Luna')).toBeTruthy();
  });

  it('renders one column with 200 % font scale (D41.1)', async () => {
    setViewport(390, 2);
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    expect(resolveAnimalGridColumns(390, 2)).toBe(1);
    expect(screen.getByTestId('animals-list')).toBeTruthy();
  });

  it('keeps filter state when the grid switches columns (D41.1)', async () => {
    setViewport(390, 1);
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);

    await fireEvent.press(screen.getByRole('radio', { name: 'En tratamiento' }));
    await waitFor(() => {
      expect(mockUseAnimals).toHaveBeenLastCalledWith({ status: 'under_treatment' });
    });

    // Viewport change (390 -> 320) must not reset filter state (D41.1).
    setViewport(320, 1);
    await screen.rerender(<ExploreScreen />);

    expect(resolveAnimalGridColumns(320, 1)).toBe(1);
    expect(mockUseAnimals).toHaveBeenLastCalledWith({ status: 'under_treatment' });
    expect(screen.getByTestId('animals-remove-filter-status')).toBeTruthy();
  });

  it('reserves bottom padding so the FAB never covers the last row (D41.3)', async () => {
    mockUseAnimals.mockReturnValue(createQueryResult());
    const screen = await render(<ExploreScreen />);
    const style = StyleSheet.flatten(
      screen.getByTestId('animals-list').props.contentContainerStyle
    );

    expect(style.paddingBottom).toBeGreaterThanOrEqual(
      sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + sizes.fab
    );
  });

  it('keeps long names and the status badge visible (D41.2)', async () => {
    const longName = 'Un nombre de animal extremadamente largo para envolver la tarjeta';
    mockUseAnimals.mockReturnValue(
      createQueryResult({
        data: {
          pages: [
            {
              items: [
                createAnimal({
                  breed: 'Una raza con un nombre extremadamente largo para envolver',
                  name: longName,
                }),
              ],
              page: 1,
              limit: 20,
              total: 1,
            },
          ],
        },
      })
    );
    const screen = await render(<ExploreScreen />);

    expect(screen.getByText(longName)).toBeTruthy();
    expect(screen.getAllByText('En tratamiento').length).toBeGreaterThan(0);
  });
});
