import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/core/api';

import { useActivateUser, useDeactivateUser } from '../hooks/useUserMutations';
import { useUsers } from '../hooks/useUsers';
import { UsersScreen } from './UsersScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../hooks/useUsers', () => ({ useUsers: jest.fn() }));
jest.mock('../hooks/useUserMutations', () => ({
  useActivateUser: jest.fn(),
  useDeactivateUser: jest.fn(),
}));

const mockUseUsers = useUsers as jest.Mock;
const mockUseActivateUser = useActivateUser as jest.Mock;
const mockUseDeactivateUser = useDeactivateUser as jest.Mock;

function renderUsersScreen() {
  return render(<UsersScreen />);
}
const activeUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'ana@refugiapp.local',
  firstName: 'Ana',
  lastName: 'Perez',
  roles: ['admin'] as const,
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};
const inactiveUser = {
  ...activeUser,
  id: '22222222-2222-4222-8222-222222222222',
  email: 'vet@refugiapp.local',
  firstName: 'Valeria',
  lastName: 'Torres',
  roles: ['veterinarian'] as const,
  isActive: false,
};

function mutation(mutate: jest.Mock = jest.fn()) {
  return { error: null, isPending: false, mutate, reset: jest.fn() };
}

describe('UsersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUsers.mockReturnValue({
      data: { pages: [{ items: [activeUser, inactiveUser], page: 1, limit: 20, total: 2 }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isPending: false,
      isRefetching: false,
      refetch: jest.fn(),
    });
    mockUseActivateUser.mockReturnValue(mutation());
    mockUseDeactivateUser.mockReturnValue(mutation());
  });

  it('shows each user role and state', async () => {
    const screen = await renderUsersScreen();
    expect(screen.getByText('Ana Perez')).toBeTruthy();
    expect(screen.getByText('Administrador')).toBeTruthy();
    expect(screen.getByText('Activo')).toBeTruthy();
    expect(screen.getByText('Inactivo')).toBeTruthy();
  });

  it('confirms before deactivating an active user', async () => {
    const mutate = jest.fn();
    mockUseDeactivateUser.mockReturnValue(mutation(mutate));
    const screen = await renderUsersScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Desactivar usuario' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar desactivación' }));
    await waitFor(() => expect(mutate).toHaveBeenCalledWith(activeUser.id, expect.any(Object)));
  });

  it('confirms before activating an inactive user', async () => {
    const mutate = jest.fn();
    mockUseActivateUser.mockReturnValue(mutation(mutate));
    const screen = await renderUsersScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Activar usuario' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar activación' }));
    await waitFor(() => expect(mutate).toHaveBeenCalledWith(inactiveUser.id, expect.any(Object)));
  });

  it('translates a 403 response', async () => {
    mockUseUsers.mockReturnValue({
      error: new ApiError({
        code: 'FORBIDDEN',
        message: 'Forbidden',
        requestId: 'request-id',
        status: 403,
      }),
      isError: true,
      isPending: false,
      refetch: jest.fn(),
    });
    const screen = await renderUsersScreen();
    expect(screen.getByText('Tu rol no tiene permiso para gestionar usuarios.')).toBeTruthy();
  });

  it('shows an offline state with retry when the network is unavailable', async () => {
    const refetch = jest.fn();
    mockUseUsers.mockReturnValue({
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
    const screen = await renderUsersScreen();
    expect(screen.getByTestId('offline-state')).toBeTruthy();
    expect(screen.getByText('Sin conexión')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('loads the next page when the list reaches the end', async () => {
    const fetchNextPage = jest.fn();
    mockUseUsers.mockReturnValue({
      data: { pages: [{ items: [activeUser], page: 1, limit: 20, total: 21 }] },
      fetchNextPage,
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: false,
      isPending: false,
      isRefetching: false,
      refetch: jest.fn(),
    });
    const screen = await renderUsersScreen();

    fireEvent(screen.getByTestId('users-list'), 'onEndReached');
    await Promise.resolve();

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('shows status mutation errors in the confirmation dialog', async () => {
    const deactivateMutation = mutation();
    mockUseDeactivateUser.mockReturnValue(deactivateMutation);
    const screen = await renderUsersScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Desactivar usuario' }));
    await Promise.resolve();
    mockUseDeactivateUser.mockReturnValue({
      ...deactivateMutation,
      error: new ApiError({
        code: 'FORBIDDEN',
        message: 'Forbidden',
        requestId: 'request-id',
        status: 403,
      }),
    });
    await screen.rerender(<UsersScreen />);

    expect(screen.getByText('Tu rol no tiene permiso para gestionar usuarios.')).toBeTruthy();
  });
});
