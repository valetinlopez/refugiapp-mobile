import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/core/api';

import { useVeterinarians } from '../hooks/useVeterinarians';
import type { VeterinarianResponse } from '../types';
import { VeterinariansScreen } from './VeterinariansScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../hooks/useVeterinarians', () => ({
  ...jest.requireActual('../hooks/useVeterinarians'),
  useVeterinarians: jest.fn(),
}));

const mockUseVeterinarians = useVeterinarians as jest.Mock;
const activeVet: VeterinarianResponse = {
  id: '11111111-1111-4111-8111-111111111111',
  userId: null,
  firstName: 'Sofía',
  lastName: 'Romero',
  licenseNumber: 'VET-001',
  email: 'sofia@refugiapp.local',
  phone: null,
  notes: null,
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};
const inactiveVet: VeterinarianResponse = {
  ...activeVet,
  id: '22222222-2222-4222-8222-222222222222',
  firstName: 'Valeria',
  lastName: 'Torres',
  licenseNumber: 'VET-002',
  email: null,
  phone: '1145550101',
  isActive: false,
};

function listQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: { pages: [{ items: [activeVet, inactiveVet], page: 1, limit: 20, total: 2 }] },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    isPending: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('VeterinariansScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVeterinarians.mockReturnValue(listQuery());
  });

  it('shows identity, contact and state for each veterinarian', async () => {
    const screen = await render(<VeterinariansScreen canWrite />);

    expect(screen.getByText('Sofía Romero')).toBeTruthy();
    expect(screen.getByText('Matrícula VET-001')).toBeTruthy();
    expect(screen.getByText('sofia@refugiapp.local')).toBeTruthy();
    expect(screen.getByText('1145550101')).toBeTruthy();
    expect(screen.getByText('Activo')).toBeTruthy();
    expect(screen.getByText('Inactivo')).toBeTruthy();
  });

  it('defaults to every status without a search filter', async () => {
    await render(<VeterinariansScreen canWrite />);

    expect(mockUseVeterinarians).toHaveBeenCalledWith({});
  });

  it('hides the floating action without write permission', async () => {
    const screen = await render(<VeterinariansScreen canWrite={false} />);

    expect(screen.queryByRole('button', { name: 'Nuevo veterinario' })).toBeNull();
  });

  it('shows the floating action with write permission', async () => {
    const screen = await render(<VeterinariansScreen canWrite />);

    expect(screen.getByRole('button', { name: 'Nuevo veterinario' })).toBeTruthy();
  });

  it('navigates to the detail on press', async () => {
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    const screen = await render(<VeterinariansScreen canWrite />);

    await fireEvent.press(screen.getByRole('button', { name: /Sofía Romero/ }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/veterinarians/[id]',
      params: { id: activeVet.id },
    });
  });

  it('maps the status filter to isActive', async () => {
    const screen = await render(<VeterinariansScreen canWrite />);

    await fireEvent.press(screen.getByRole('radio', { name: 'Inactivos' }));
    await waitFor(() => expect(mockUseVeterinarians).toHaveBeenLastCalledWith({ isActive: false }));

    await fireEvent.press(screen.getByRole('radio', { name: 'Todos' }));
    await waitFor(() => expect(mockUseVeterinarians).toHaveBeenLastCalledWith({}));
  });

  it('quick-searches by name after the debounce', async () => {
    const screen = await render(<VeterinariansScreen canWrite />);

    await fireEvent.changeText(
      screen.getByLabelText('Buscar veterinario por nombre o matrícula'),
      'Sofía'
    );

    await waitFor(() => expect(mockUseVeterinarians).toHaveBeenLastCalledWith({ name: 'Sofía' }));
  });

  it('quick-searches by license when the term contains digits', async () => {
    const screen = await render(<VeterinariansScreen canWrite />);

    await fireEvent.changeText(
      screen.getByLabelText('Buscar veterinario por nombre o matrícula'),
      'VET-001'
    );

    await waitFor(() =>
      expect(mockUseVeterinarians).toHaveBeenLastCalledWith({ licenseNumber: 'VET-001' })
    );
  });

  it('applies combined name and license filters from the sheet', async () => {
    const screen = await render(<VeterinariansScreen canWrite />);

    await fireEvent.press(screen.getByTestId('veterinarians-open-filters'));
    await fireEvent.changeText(screen.getByLabelText('Buscar por nombre'), 'Romero');
    await fireEvent.changeText(screen.getByLabelText('Buscar por matrícula'), 'VET-001');
    await fireEvent.press(screen.getByTestId('veterinarians-filter-apply'));

    expect(mockUseVeterinarians).toHaveBeenLastCalledWith({
      name: 'Romero',
      licenseNumber: 'VET-001',
    });
  });

  it('clears every filter from the toolbar', async () => {
    const screen = await render(<VeterinariansScreen canWrite />);

    await fireEvent.press(screen.getByRole('radio', { name: 'Inactivos' }));
    await waitFor(() => expect(mockUseVeterinarians).toHaveBeenLastCalledWith({ isActive: false }));

    await fireEvent.press(screen.getByTestId('veterinarians-clear-filters'));

    expect(mockUseVeterinarians).toHaveBeenLastCalledWith({});
  });

  it('loads the next page when the list reaches the end', async () => {
    const fetchNextPage = jest.fn();
    mockUseVeterinarians.mockReturnValue(listQuery({ fetchNextPage, hasNextPage: true }));
    const screen = await render(<VeterinariansScreen canWrite />);

    await fireEvent(screen.getByTestId('veterinarians-list'), 'onEndReached');

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('de-duplicates rows repeated across pages', async () => {
    mockUseVeterinarians.mockReturnValue(
      listQuery({
        data: {
          pages: [
            { items: [activeVet], page: 1, limit: 20, total: 2 },
            { items: [activeVet, inactiveVet], page: 2, limit: 20, total: 2 },
          ],
        },
      })
    );
    const screen = await render(<VeterinariansScreen canWrite={false} />);

    expect(screen.getAllByText('Sofía Romero')).toHaveLength(1);
    expect(screen.getByText('Valeria Torres')).toBeTruthy();
  });

  it('translates a 403 response', async () => {
    mockUseVeterinarians.mockReturnValue(
      listQuery({
        data: undefined,
        error: new ApiError({
          code: 'FORBIDDEN',
          message: 'Forbidden',
          requestId: 'request-id',
          status: 403,
        }),
        isError: true,
      })
    );
    const screen = await render(<VeterinariansScreen canWrite={false} />);

    expect(screen.getByText('Tu rol no tiene permiso para gestionar veterinarios.')).toBeTruthy();
  });

  it('shows the offline state when the request fails without connection', async () => {
    mockUseVeterinarians.mockReturnValue(
      listQuery({
        data: undefined,
        error: new ApiError({
          code: 'NETWORK_ERROR',
          message: 'Network error',
          requestId: 'request-id',
          status: 0,
        }),
        isError: true,
      })
    );
    const screen = await render(<VeterinariansScreen canWrite={false} />);

    expect(screen.getByText('Sin conexión')).toBeTruthy();
  });

  it('shows an empty state that can clear active filters', async () => {
    mockUseVeterinarians.mockReturnValue(
      listQuery({ data: { pages: [{ items: [], page: 1, limit: 20, total: 0 }] } })
    );
    const screen = await render(<VeterinariansScreen canWrite={false} />);

    await fireEvent.press(screen.getByRole('radio', { name: 'Activos' }));

    expect(screen.getByText('Sin veterinarios')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(mockUseVeterinarians).toHaveBeenLastCalledWith({});
  });
});
