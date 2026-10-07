import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/core/api';

import { useCreateUser } from '../hooks/useUserMutations';
import { CreateUserScreen } from './CreateUserScreen';

jest.mock('../hooks/useUserMutations', () => ({ useCreateUser: jest.fn() }));

const mockUseCreateUser = useCreateUser as jest.Mock;

function createMutation(overrides = {}) {
  return {
    error: null,
    isPending: false,
    mutate: jest.fn(),
    reset: jest.fn(),
    ...overrides,
  };
}

async function completeForm(screen: Awaited<ReturnType<typeof render>>) {
  await fireEvent.changeText(screen.getByLabelText('Nombre'), ' Ana ');
  await fireEvent.changeText(screen.getByLabelText('Apellido'), ' Perez ');
  await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), ' ADMIN@Example.com ');
  await fireEvent.changeText(screen.getByLabelText('Contraseña inicial'), 'secure-pass-123');
  await fireEvent.press(screen.getByRole('checkbox', { name: 'Administrador' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Revisar y crear' }));
}

describe('CreateUserScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCreateUser.mockReturnValue(createMutation());
  });

  it('requires confirmation and sends the exact multirole contract', async () => {
    const mutate = jest.fn();
    const onCreated = jest.fn();
    mockUseCreateUser.mockReturnValue(createMutation({ mutate }));
    const screen = await render(<CreateUserScreen onCancel={jest.fn()} onCreated={onCreated} />);

    await completeForm(screen);

    expect(await screen.findByText('Confirmar nuevo usuario')).toBeTruthy();
    expect(screen.getByText(/admin@example.com/)).toBeTruthy();
    expect(mutate).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar creación de usuario' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          email: 'admin@example.com',
          firstName: 'Ana',
          lastName: 'Perez',
          password: 'secure-pass-123',
          roles: ['shelter_manager', 'admin'],
        },
        expect.any(Object)
      )
    );
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('shows an accessible email conflict in the confirmation', async () => {
    mockUseCreateUser.mockReturnValue(
      createMutation({
        error: new ApiError({
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Email exists.',
          requestId: 'request-id',
          status: 409,
        }),
      })
    );
    const screen = await render(<CreateUserScreen onCancel={jest.fn()} onCreated={jest.fn()} />);

    await completeForm(screen);

    expect(await screen.findByText('Ya existe un usuario registrado con ese email.')).toBeTruthy();
    expect(screen.getByTestId('confirm-dialog').props.accessibilityRole).toBe('alert');
  });
});
