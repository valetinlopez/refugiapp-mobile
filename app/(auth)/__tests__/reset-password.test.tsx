import { useLocalSearchParams } from 'expo-router';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/core/api';
import { authApi } from '@/features/auth/api/authApi';
import { useSession } from '@/features/auth/session';

import ResetPasswordScreen from '../reset-password';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  router: { back: jest.fn(), canGoBack: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

jest.mock('@/features/auth/session', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/features/auth/api/authApi', () => ({
  authApi: { confirmPasswordReset: jest.fn() },
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockUseSession = useSession as jest.Mock;
const mockConfirmPasswordReset = authApi.confirmPasswordReset as jest.Mock;
const { router } = jest.requireMock('expo-router') as {
  router: { back: jest.Mock; canGoBack: jest.Mock; push: jest.Mock; replace: jest.Mock };
};

function apiError(code: string): ApiError {
  return new ApiError({
    code,
    message: 'Mensaje técnico del core.',
    requestId: 'req-1',
    status: 400,
  });
}

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ endSession: jest.fn().mockResolvedValue(undefined) });
  });

  it('captures the token once, sanitizes the URL and does not leak it', async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: 'raw-single-use-token' });
    const screen = await render(<ResetPasswordScreen />);

    expect(screen.getByLabelText('Contraseña nueva')).toBeTruthy();
    expect(router.replace).toHaveBeenCalledWith('/reset-password');
    expect(screen.queryByText('raw-single-use-token')).toBeNull();
  });

  it('shows an invalid link state with a request-new action when no token is present', async () => {
    mockUseLocalSearchParams.mockReturnValue({});
    const screen = await render(<ResetPasswordScreen />);

    expect(screen.getByText('Enlace no válido')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Solicitar enlace nuevo' })).toBeTruthy();
    expect(screen.queryByLabelText('Contraseña nueva')).toBeNull();
  });

  it('confirms a valid token, ends the local session and returns to login', async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: 'raw-single-use-token' });
    const endSession = jest.fn().mockResolvedValue(undefined);
    mockUseSession.mockReturnValue({ endSession });
    mockConfirmPasswordReset.mockResolvedValue(undefined);

    const screen = await render(<ResetPasswordScreen />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'strong-password');
    await fireEvent.changeText(
      screen.getByLabelText('Confirmar contraseña nueva'),
      'strong-password'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Definir nueva contraseña' }));

    await waitFor(() => {
      expect(mockConfirmPasswordReset).toHaveBeenCalledWith({
        token: 'raw-single-use-token',
        newPassword: 'strong-password',
      });
    });
    expect(endSession).toHaveBeenCalledWith(
      'Tu contraseña fue actualizada. Iniciá sesión nuevamente.'
    );
    expect(router.replace).toHaveBeenLastCalledWith('/login');
  });

  it('differentiates an expired token, drops it from memory and offers a new link', async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: 'raw-single-use-token' });
    mockConfirmPasswordReset.mockRejectedValue(apiError('PASSWORD_RESET_TOKEN_EXPIRED'));

    const screen = await render(<ResetPasswordScreen />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'strong-password');
    await fireEvent.changeText(
      screen.getByLabelText('Confirmar contraseña nueva'),
      'strong-password'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Definir nueva contraseña' }));

    await waitFor(() => {
      expect(
        screen.getByText('El enlace de recuperación venció. Solicitá uno nuevo.')
      ).toBeTruthy();
    });
    expect(screen.getByRole('button', { name: 'Solicitar enlace nuevo' })).toBeTruthy();
    expect(screen.queryByLabelText('Contraseña nueva')).toBeNull();
    expect(screen.queryByText('raw-single-use-token')).toBeNull();
  });

  it('does not re-send the mutation after a token error', async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: 'raw-single-use-token' });
    mockConfirmPasswordReset.mockRejectedValue(apiError('INVALID_PASSWORD_RESET_TOKEN'));

    const screen = await render(<ResetPasswordScreen />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'strong-password');
    await fireEvent.changeText(
      screen.getByLabelText('Confirmar contraseña nueva'),
      'strong-password'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Definir nueva contraseña' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Solicitar enlace nuevo' })).toBeTruthy();
    });
    expect(mockConfirmPasswordReset).toHaveBeenCalledTimes(1);
  });
});
