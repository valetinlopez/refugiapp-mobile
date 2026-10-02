import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/core/api';
import { authApi } from '@/features/auth/api/authApi';
import { useSession } from '@/features/auth/session';

import ChangePasswordScreen from '../change-password';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(() => true), push: jest.fn(), replace: jest.fn() },
}));

jest.mock('@/features/auth/session', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/features/auth/api/authApi', () => ({
  authApi: { changePassword: jest.fn() },
}));

const mockChangePassword = authApi.changePassword as jest.Mock;
const mockUseSession = useSession as jest.Mock;

describe('ChangePasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ endSession: jest.fn().mockResolvedValue(undefined) });
  });

  it('changes the password and ends the local session with a success notice', async () => {
    const endSession = jest.fn().mockResolvedValue(undefined);
    mockUseSession.mockReturnValue({ endSession });
    mockChangePassword.mockResolvedValue(undefined);

    const screen = await render(<ChangePasswordScreen />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña actual'), 'current-password');
    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'strong-password');
    await fireEvent.changeText(
      screen.getByLabelText('Confirmar contraseña nueva'),
      'strong-password'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: 'current-password',
        newPassword: 'strong-password',
      });
    });
    expect(endSession).toHaveBeenCalledWith(
      'Tu contraseña fue actualizada. Iniciá sesión nuevamente.'
    );
  });

  it('shows a specific message for an invalid current password without ending the session', async () => {
    const endSession = jest.fn().mockResolvedValue(undefined);
    mockUseSession.mockReturnValue({ endSession });
    mockChangePassword.mockRejectedValue(
      new ApiError({
        code: 'INVALID_CURRENT_PASSWORD',
        message: 'Mensaje técnico del core.',
        requestId: 'req-1',
        status: 401,
      })
    );

    const screen = await render(<ChangePasswordScreen />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña actual'), 'wrong-password');
    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'strong-password');
    await fireEvent.changeText(
      screen.getByLabelText('Confirmar contraseña nueva'),
      'strong-password'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'La contraseña actual no es correcta. Intentá de nuevo.'
      );
    });
    expect(endSession).not.toHaveBeenCalled();
  });

  it('keeps double submit blocked while the request is in flight', async () => {
    let resolveChange!: () => void;
    mockChangePassword.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveChange = resolve;
        })
    );

    const screen = await render(<ChangePasswordScreen />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña actual'), 'current-password');
    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'strong-password');
    await fireEvent.changeText(
      screen.getByLabelText('Confirmar contraseña nueva'),
      'strong-password'
    );
    const submit = screen.getByRole('button', { name: 'Cambiar contraseña' });
    await fireEvent.press(submit);
    await fireEvent.press(submit);

    expect(mockChangePassword).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveChange();
    });
  });
});
