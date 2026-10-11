import { fireEvent, render, within } from '@testing-library/react-native';

import type { HomePriority } from '@/application/home';
import { ApiError } from '@/core/api';
import { useSession } from '@/features/auth/session';
import { DashboardScreen } from '@/features/dashboard/components/DashboardScreen';
import { useDashboardOverview } from '@/features/dashboard/hooks/useDashboardOverview';
import type { DashboardAnimal, DashboardOverview } from '@/features/dashboard/types';
import { getSessionGreeting } from '@/features/dashboard/utils/greeting';

import { useAnimalOptions, useAnimalOptionPhoto } from '@/application/animals';
import { useHomeSummary } from '@/application/home';

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
  useDashboardAnimalPhoto: jest.fn(() => ({ data: undefined, isError: false, isPending: false })),
}));

jest.mock('@/application/home', () => ({
  ...jest.requireActual('@/application/home'),
  useHomeSummary: jest.fn(),
}));

jest.mock('@/application/animals', () => ({
  ...jest.requireActual('@/application/animals'),
  useAnimalOptions: jest.fn(),
  useAnimalOptionPhoto: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;
const mockUseDashboardOverview = useDashboardOverview as jest.Mock;
const mockUseHomeSummary = useHomeSummary as jest.Mock;
const mockUseAnimalOptions = useAnimalOptions as jest.Mock;
const mockUseAnimalOptionPhoto = useAnimalOptionPhoto as jest.Mock;
const { router } = jest.requireMock('expo-router') as {
  router: { push: jest.Mock };
};

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const TASK_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

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

function createOverviewQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: createOverview(),
    error: undefined,
    isError: false,
    isPending: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

function createPriority(overrides: Partial<HomePriority> = {}): HomePriority {
  return {
    animalId: ANIMAL_ID,
    dueAt: '2026-10-10T11:00:00-03:00',
    id: TASK_ID,
    state: 'upcoming',
    title: 'Control veterinario',
    ...overrides,
  };
}

function createHomeSummary(overrides: Record<string, unknown> = {}) {
  return {
    expenseCount: 12,
    expenseCountIsError: false,
    isPending: false,
    pendingCareTaskCount: 6,
    pendingCareTaskCountIsError: false,
    priorities: [createPriority()],
    prioritiesIsError: false,
    prioritiesIsPending: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('DashboardScreen (D36 / RFG-169)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ user: { firstName: 'Andrés', roles: ['admin'] } });
    mockUseDashboardOverview.mockReturnValue(createOverviewQuery());
    mockUseHomeSummary.mockReturnValue(createHomeSummary());
    mockUseAnimalOptions.mockReturnValue({ data: [{ id: ANIMAL_ID, name: 'Luna' }] });
    mockUseAnimalOptionPhoto.mockReturnValue({ data: undefined, isError: false, isPending: false });
  });

  it('shows the skeleton while the overview loads', async () => {
    mockUseDashboardOverview.mockReturnValue(
      createOverviewQuery({ data: undefined, isPending: true, isError: false })
    );
    const screen = await render(<DashboardScreen />);

    expect(screen.getByLabelText('Cargando panel')).toBeTruthy();
  });

  it('shows an error state with retry', async () => {
    const refetch = jest.fn();
    mockUseDashboardOverview.mockReturnValue(
      createOverviewQuery({ data: undefined, isError: true, refetch })
    );
    const screen = await render(<DashboardScreen />);

    expect(screen.getByText('No se pudo cargar el panel')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an offline state with retry when the network is unavailable', async () => {
    const refetch = jest.fn();
    mockUseDashboardOverview.mockReturnValue(
      createOverviewQuery({
        data: undefined,
        error: new ApiError({
          code: 'NETWORK_ERROR',
          message: 'No pudimos conectar con el servicio. Revisá tu conexión.',
          requestId: 'request-id',
          status: 0,
        }),
        isError: true,
        refetch,
      })
    );
    const screen = await render(<DashboardScreen />);

    expect(screen.getByTestId('offline-state')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('renders the greeting from the session first name', async () => {
    const screen = await render(<DashboardScreen />);

    expect(screen.getByText(getSessionGreeting('Andrés'))).toBeTruthy();
  });

  it('shows the three real indicators in the summary', async () => {
    const screen = await render(<DashboardScreen />);

    const summary = within(screen.getByTestId('home-summary'));
    expect(summary.getByText('Animales')).toBeTruthy();
    expect(summary.getByText('En tratamiento')).toBeTruthy();
    expect(summary.getByText('Cuidados pendientes')).toBeTruthy();
    expect(summary.getByText('6')).toBeTruthy();
  });

  it('offers the four navigation accesses to an admin', async () => {
    const screen = await render(<DashboardScreen />);

    expect(screen.getByTestId('home-access-animals')).toBeTruthy();
    expect(screen.getByTestId('home-access-care-tasks')).toBeTruthy();
    expect(screen.getByTestId('home-access-medical-records')).toBeTruthy();
    expect(screen.getByTestId('home-access-expenses')).toBeTruthy();
  });

  it('hides the clinical access for a shelter manager', async () => {
    mockUseSession.mockReturnValue({ user: { firstName: 'Sofía', roles: ['shelter_manager'] } });
    const screen = await render(<DashboardScreen />);

    expect(screen.getByTestId('home-access-animals')).toBeTruthy();
    expect(screen.queryByTestId('home-access-medical-records')).toBeNull();
  });

  it('shows an empty state when there are no active animals', async () => {
    const overview = createOverview();
    overview.totals.animals = 0;
    overview.recentAnimals = [];
    mockUseDashboardOverview.mockReturnValue(createOverviewQuery({ data: overview }));
    const screen = await render(<DashboardScreen />);

    expect(screen.getByText('Sin datos')).toBeTruthy();
    expect(screen.queryByTestId('home-priorities')).toBeNull();
  });

  it('navigates to a priority task from the priorities section', async () => {
    const screen = await render(<DashboardScreen />);

    await fireEvent.press(screen.getByTestId('home-priority-row'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/care-tasks/[id]',
      params: { id: TASK_ID },
    });
  });

  it('opens the full agenda', async () => {
    const screen = await render(<DashboardScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Ver todos los cuidados' }));
    expect(router.push).toHaveBeenCalledWith('/care-tasks');
  });

  it('navigates to a recent animal detail', async () => {
    const screen = await render(<DashboardScreen />);

    await fireEvent.press(screen.getByRole('button', { name: /Luna, dog/ }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/animals/[id]',
      params: { id: ANIMAL_ID },
    });
  });

  it('refetches the overview and the home summary on pull to refresh', async () => {
    const overviewRefetch = jest.fn();
    const homeRefetch = jest.fn();
    mockUseDashboardOverview.mockReturnValue(createOverviewQuery({ refetch: overviewRefetch }));
    mockUseHomeSummary.mockReturnValue(createHomeSummary({ refetch: homeRefetch }));
    const screen = await render(<DashboardScreen />);

    const refreshControl = screen.root
      ?.queryAll((instance) => instance.type === 'RCTRefreshControl')
      .find(() => true);

    expect(refreshControl).toBeDefined();
    if (refreshControl === undefined) {
      throw new Error('RefreshControl not found in the rendered tree');
    }

    await fireEvent(refreshControl, 'refresh');

    expect(overviewRefetch).toHaveBeenCalled();
    expect(homeRefetch).toHaveBeenCalled();
  });
});
