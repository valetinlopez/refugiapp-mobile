import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/core/api';
import { authApi } from '@/features/auth/api/authApi';

import ForgotPasswordScreen from '../forgot-password';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(() => true), push: jest.fn(), replace: jest.fn() },
}));

jest.mock('@/features/auth/api/authApi', () => ({
  authApi: { requestPasswordReset: jest.fn() },
}));

const mockRequestPasswordReset = authApi.requestPasswordReset as jest.Mock;
const { router } = jest.requireMock('expo-router') as {
  router: { back: jest.Mock; canGoBack: jest.Mock; push: jest.Mock; replace: jest.Mock };
};

const GENERIC_MESSAGE =
  'Si existe una cuenta activa con ese correo, enviamos instrucciones para restablecer tu contraseña.';
const RATE_LIMIT_MESSAGE =
  'Llegaste al límite de intentos (5 por minuto). Esperá 60 segundos e intentá de nuevo.';

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('requests recovery and shows the same generic confirmation for any account', async () => {
    mockRequestPasswordReset.mockResolvedValue({
      message: 'If an active account exists, recovery instructions will be sent.',
    });
    const screen = await render(<ForgotPasswordScreen />);

    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'user@example.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar enlace de recuperación' }));

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({ email: 'user@example.com' });
    });
    expect(screen.getByText(GENERIC_MESSAGE)).toBeTruthy();
    expect(screen.queryByLabelText('Correo electrónico')).toBeNull();
  });

  it('communicates the spam hint and the link TTL after the request', async () => {
    mockRequestPasswordReset.mockResolvedValue({ message: 'generic' });
    const screen = await render(<ForgotPasswordScreen />);

    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'user@example.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar enlace de recuperación' }));

    await waitFor(() => {
      expect(screen.getByTestId('forgot-password-hints')).toHaveTextContent(
        /revisá la carpeta de spam o correo no deseado/
      );
    });
    expect(screen.getByTestId('forgot-password-hints')).toHaveTextContent(/vence en 30 minutos/);
  });

  it('disables resend during the 60s cooldown and re-enables it afterwards', async () => {
    jest.useFakeTimers();
    mockRequestPasswordReset.mockResolvedValue({ message: 'generic' });
    const screen = await render(<ForgotPasswordScreen />);

    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'user@example.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar enlace de recuperación' }));

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledTimes(1);
    });

    const blockedResend = screen.getByRole('button', { name: /Reenviar en \d+s/ });
    expect(blockedResend.props.accessibilityState.disabled).toBe(true);

    await fireEvent.press(blockedResend);
    expect(mockRequestPasswordReset).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });

    const resend = screen.getByRole('button', { name: 'Reenviar correo' });
    expect(resend.props.accessibilityState.disabled).toBe(false);

    await fireEvent.press(resend);

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledTimes(2);
    });
    expect(mockRequestPasswordReset).toHaveBeenLastCalledWith({ email: 'user@example.com' });
  });

  it('surfaces the explicit rate limit wait instead of a generic error on resend', async () => {
    jest.useFakeTimers();
    mockRequestPasswordReset.mockResolvedValueOnce({ message: 'generic' });
    mockRequestPasswordReset.mockRejectedValueOnce(
      new ApiError({ code: 'HTTP_429', message: 'rate limited', requestId: 'req-1', status: 429 })
    );
    const screen = await render(<ForgotPasswordScreen />);

    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'user@example.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar enlace de recuperación' }));

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Reenviar correo' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(RATE_LIMIT_MESSAGE);
    });
    expect(mockRequestPasswordReset).toHaveBeenCalledTimes(2);
  });

  it('shows a translated error when the request fails', async () => {
    mockRequestPasswordReset.mockRejectedValue(
      new ApiError({
        code: 'NETWORK_ERROR',
        message: 'No pudimos conectar con el servicio. Revisá tu conexión.',
        requestId: 'req-1',
        status: 0,
      })
    );
    const screen = await render(<ForgotPasswordScreen />);

    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'user@example.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar enlace de recuperación' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No pudimos conectar con el servicio. Revisá tu conexión.'
      );
    });
    expect(screen.queryByText(GENERIC_MESSAGE)).toBeNull();
  });

  it('returns to login without a recovery request when back is pressed', async () => {
    mockRequestPasswordReset.mockResolvedValue({ message: 'generic' });
    const screen = await render(<ForgotPasswordScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));

    expect(mockRequestPasswordReset).not.toHaveBeenCalled();
    expect(router.back).toHaveBeenCalled();
  });
});
