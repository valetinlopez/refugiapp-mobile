import { fireEvent, render } from '@testing-library/react-native';

import { useSession } from '@/features/auth/session';
import { DashboardScreen } from '@/features/dashboard/components/DashboardScreen';
import { useDashboardAnimalPhoto } from '@/features/dashboard/hooks/useDashboardAnimalPhoto';
import { useDashboardOverview } from '@/features/dashboard/hooks/useDashboardOverview';
import type { DashboardAnimal, DashboardOverview } from '@/features/dashboard/types';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/features/auth/session', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/features/dashboard/hooks/useDashboardOverview', () => ({
  useDashboardOverview: jest.fn(),
}));

jest.mock('@/features/dashboard/hooks/useDashboardAnimalPhoto', () => ({
  useDashboardAnimalPhoto: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;
const mockUseDashboardOverview = useDashboardOverview as jest.Mock;
const mockUseDashboardAnimalPhoto = useDashboardAnimalPhoto as jest.Mock;
const { router } = jest.requireMock('expo-router') as {
  router: { push: jest.Mock };
};

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const MEDIA_ID = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';

function createAnimal(overrides: Partial<DashboardAnimal> = {}): DashboardAnimal {
  return {
    id: ANIMAL_ID,
    name: 'Luna',
    species: 'dog',
    status: 'admitted',
    profilePhotoMediaId: null,
    ...overrides,
  };
}

function createOverview(): DashboardOverview {
  return {
    totals: {
      animals: 3,
      byStatus: {
        admitted: 1,
        under_treatment: 1,
        available_for_adoption: 1,
        adopted: 0,
        deceased: 0,
      },
    },
    recentAnimals: [createAnimal()],
  };
}

function createQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: createOverview(),
    isError: false,
    isPending: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ user: { roles: ['admin'] } });
    mockUseDashboardAnimalPhoto.mockReturnValue({
      data: undefined,
      isError: false,
      isPending: false,
    });
  });

  it('shows the skeleton while loading', async () => {
    mockUseDashboardOverview.mockReturnValue(
      createQuery({ data: undefined, isPending: true, isError: false })
    );
    const screen = await render(<DashboardScreen />);

    expect(screen.getByLabelText('Cargando panel')).toBeTruthy();
  });

  it('shows an error state with retry', async () => {
    const refetch = jest.fn();
    mockUseDashboardOverview.mockReturnValue(
      createQuery({ data: undefined, isError: true, refetch })
    );
    const screen = await render(<DashboardScreen />);

    expect(screen.getByText('No se pudo cargar el panel')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an empty state when there are no active animals', async () => {
    const overview = createOverview();
    overview.totals.animals = 0;
    overview.recentAnimals = [];
    mockUseDashboardOverview.mockReturnValue(createQuery({ data: overview }));
    const screen = await render(<DashboardScreen />);

    expect(screen.getByText('Sin datos')).toBeTruthy();
    expect(screen.queryByText('Luna')).toBeNull();
  });

  it('renders totals, recent animals and navigates to the detail', async () => {
    mockUseDashboardOverview.mockReturnValue(createQuery());
    const screen = await render(<DashboardScreen />);

    expect(screen.getByText('Animales activos')).toBeTruthy();
    expect(screen.getByText('Luna')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: /Luna, dog/ }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/animals/[id]',
      params: { id: ANIMAL_ID },
    });
  });

  it('renders one badge per animal status in the totals card', async () => {
    mockUseDashboardOverview.mockReturnValue(createQuery());
    const screen = await render(<DashboardScreen />);

    expect(screen.getByText('Ingresado: 1')).toBeTruthy();
    expect(screen.getByText('En tratamiento: 1')).toBeTruthy();
    expect(screen.getByText('Disponible para adopción: 1')).toBeTruthy();
    expect(screen.getByText('Adoptado: 0')).toBeTruthy();
    expect(screen.getByText('Fallecido: 0')).toBeTruthy();
  });

  it('truncates long recent animal name and species but keeps the full label accessible', async () => {
    const overview = createOverview();
    overview.recentAnimals = [createAnimal({ name: 'Flavia Azzara', species: 'Perra' })];
    mockUseDashboardOverview.mockReturnValue(createQuery({ data: overview }));
    const screen = await render(<DashboardScreen />);

    expect(screen.getByText('Flavia Azzara').props.numberOfLines).toBe(1);
    expect(screen.getByText('Perra').props.numberOfLines).toBe(1);

    await fireEvent.press(screen.getByRole('button', { name: /Flavia Azzara, Perra/ }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/animals/[id]',
      params: { id: ANIMAL_ID },
    });
  });

  it('requests the profile photo when the animal has a media id', async () => {
    const overview = createOverview();
    overview.recentAnimals = [createAnimal({ profilePhotoMediaId: MEDIA_ID })];
    mockUseDashboardOverview.mockReturnValue(createQuery({ data: overview }));
    await render(<DashboardScreen />);

    expect(mockUseDashboardAnimalPhoto).toHaveBeenCalledWith(MEDIA_ID);
  });

  it('skips the photo request when the animal has no media id', async () => {
    mockUseDashboardOverview.mockReturnValue(createQuery());
    await render(<DashboardScreen />);

    expect(mockUseDashboardAnimalPhoto).toHaveBeenCalledWith(null);
  });

  it('offers writer quick actions to admin', async () => {
    mockUseDashboardOverview.mockReturnValue(createQuery());
    const screen = await render(<DashboardScreen />);

    expect(screen.getByRole('button', { name: 'Alta animal' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nueva tarea' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Registrar gasto' })).toBeTruthy();
  });

  it('hides writer quick actions for a veterinarian', async () => {
    mockUseSession.mockReturnValue({ user: { roles: ['veterinarian'] } });
    mockUseDashboardOverview.mockReturnValue(createQuery());
    const screen = await render(<DashboardScreen />);

    expect(screen.queryByRole('button', { name: 'Alta animal' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Registrar gasto' })).toBeNull();
  });

  it('triggers a refetch on pull to refresh', async () => {
    const refetch = jest.fn();
    mockUseDashboardOverview.mockReturnValue(createQuery({ refetch }));
    const screen = await render(<DashboardScreen />);

    const refreshControl = screen.root
      ?.queryAll((instance) => instance.type === 'RCTRefreshControl')
      .find(() => true);

    expect(refreshControl).toBeDefined();
    if (refreshControl === undefined) {
      throw new Error('RefreshControl not found in the rendered tree');
    }

    await fireEvent(refreshControl, 'refresh');

    expect(refetch).toHaveBeenCalled();
  });
});
