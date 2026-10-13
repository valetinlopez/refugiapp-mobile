import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/core/api';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import { useDeleteUser, useUpdateUser } from '../hooks/useUserMutations';
import { useUser } from '../hooks/useUser';
import { UserEditScreen } from './UserEditScreen';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('../hooks/useUser', () => ({ useUser: jest.fn() }));
jest.mock('../hooks/useUserMutations', () => ({
  useDeleteUser: jest.fn(),
  useUpdateUser: jest.fn(),
}));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({
  useCapabilities: jest.fn(),
}));

const mockUseUser = useUser as jest.Mock;
const mockUseUpdateUser = useUpdateUser as jest.Mock;
const mockUseDeleteUser = useDeleteUser as jest.Mock;
const mockUseCapabilities = useCapabilities as jest.Mock;

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'manager@refugiapp.local',
  firstName: 'Sofia',
  lastName: 'Ramirez',
  roles: ['shelter_manager'] as const,
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

function updateMutation(overrides = {}) {
  return {
    error: null,
    isPending: false,
    mutate: jest.fn(),
    reset: jest.fn(),
    ...overrides,
  };
}

function deleteMutation(overrides = {}) {
  return {
    error: null,
    isPending: false,
    mutate: jest.fn(),
    reset: jest.fn(),
    ...overrides,
  };
}

describe('UserEditScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCapabilities.mockReturnValue({ canDeleteProtected: false });
    mockUseUser.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      refetch: jest.fn(),
      user,
    });
    mockUseUpdateUser.mockReturnValue(updateMutation());
    mockUseDeleteUser.mockReturnValue(deleteMutation());
  });

  it('saves profile changes without confirmation when the role is unchanged', async () => {
    const mutate = jest.fn();
    mockUseUpdateUser.mockReturnValue(updateMutation({ mutate }));
    const screen = await render(<UserEditScreen userId={user.id} />);

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Sofía');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { id: user.id, data: { firstName: 'Sofía' } },
        expect.any(Object)
      )
    );
  });

  it('asks for confirmation before changing the role', async () => {
    const mutate = jest.fn();
    mockUseUpdateUser.mockReturnValue(updateMutation({ mutate }));
    const screen = await render(<UserEditScreen userId={user.id} />);

    await fireEvent.press(screen.getByRole('radio', { name: 'Administrador' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Cambiar rol')).toBeTruthy();
    expect(mutate).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar cambio de rol' }));
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { id: user.id, data: { roles: ['admin'] } },
        expect.any(Object)
      )
    );
  });

  it('warns when there are no changes to save', async () => {
    const mutate = jest.fn();
    mockUseUpdateUser.mockReturnValue(updateMutation({ mutate }));
    const screen = await render(<UserEditScreen userId={user.id} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Sin cambios para guardar.')).toBeTruthy();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('translates a last-admin conflict without exposing details', async () => {
    mockUseUpdateUser.mockReturnValue(
      updateMutation({
        error: new ApiError({
          code: 'LAST_ADMIN_FORBIDDEN',
          message: 'Cannot remove the admin role.',
          requestId: 'request-id',
          status: 409,
        }),
      })
    );
    const screen = await render(<UserEditScreen userId={user.id} />);

    expect(
      screen.getByText('No se puede quitar el rol de administrador al último administrador activo.')
    ).toBeTruthy();
  });

  it('shows an empty state when the user is not in the cached list', async () => {
    mockUseUser.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      refetch: jest.fn(),
      user: undefined,
    });
    const screen = await render(<UserEditScreen userId={user.id} />);

    expect(screen.getByText('Usuario no disponible')).toBeTruthy();
  });

  it('hides the delete action without the admin delete capability', async () => {
    mockUseCapabilities.mockReturnValue({ canDeleteProtected: false });
    const screen = await render(<UserEditScreen userId={user.id} />);

    expect(screen.queryByTestId('user-delete')).toBeNull();
  });

  it('runs the delete flow only after double confirmation with explicit acknowledgement', async () => {
    mockUseCapabilities.mockReturnValue({ canDeleteProtected: true });
    const mutate = jest.fn();
    mockUseDeleteUser.mockReturnValue(deleteMutation({ mutate }));
    const screen = await render(<UserEditScreen userId={user.id} />);

    await fireEvent.press(screen.getByTestId('user-delete'));
    expect(screen.getByText('¿Eliminar a Sofia Ramirez permanentemente?')).toBeTruthy();
    expect(mutate).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText('Continuar'));
    const confirm = screen.getByTestId('delete-user-confirm');
    await fireEvent.press(confirm);
    expect(mutate).not.toHaveBeenCalled();

    await fireEvent(screen.getByTestId('delete-user-acknowledge'), 'valueChange', true);
    await fireEvent.press(confirm);
    await waitFor(() => expect(mutate).toHaveBeenCalledWith(user.id, expect.any(Object)));
  });
});
