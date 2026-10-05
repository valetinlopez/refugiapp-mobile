import { ApiError } from '@/core/api';

import {
  isPasswordResetTokenError,
  toChangePasswordErrorMessage,
  toConfirmPasswordResetErrorMessage,
  toRequestPasswordResetErrorMessage,
} from './passwordErrorMessages';

function apiError(status: number, code: string = `HTTP_${status}`): ApiError {
  return new ApiError({
    code,
    message: 'Mensaje técnico del core.',
    requestId: 'req-1',
    status,
  });
}

describe('toChangePasswordErrorMessage', () => {
  it('translates an invalid current password without leaking internals', () => {
    expect(toChangePasswordErrorMessage(apiError(401, 'INVALID_CURRENT_PASSWORD'))).toBe(
      'La contraseña actual no es correcta. Intentá de nuevo.'
    );
  });

  it('translates validation and rate limit responses', () => {
    expect(toChangePasswordErrorMessage(apiError(400))).toBe(
      'Revisá los datos ingresados e intentá de nuevo.'
    );
    expect(toChangePasswordErrorMessage(apiError(422))).toBe(
      'Revisá los datos ingresados e intentá de nuevo.'
    );
    expect(toChangePasswordErrorMessage(apiError(429))).toBe(
      'Llegaste al límite de intentos (5 por minuto). Esperá 60 segundos e intentá de nuevo.'
    );
  });

  it('falls back to the normalized core message for other server and network errors', () => {
    expect(toChangePasswordErrorMessage(apiError(500))).toBe('Mensaje técnico del core.');
    expect(toChangePasswordErrorMessage(apiError(0))).toBe('Mensaje técnico del core.');
  });

  it('falls back to a safe generic message for unknown errors', () => {
    expect(toChangePasswordErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Intentá de nuevo.'
    );
  });
});

describe('toRequestPasswordResetErrorMessage', () => {
  it('translates validation and rate limit responses', () => {
    expect(toRequestPasswordResetErrorMessage(apiError(400))).toBe(
      'Revisá los datos ingresados e intentá de nuevo.'
    );
    expect(toRequestPasswordResetErrorMessage(apiError(422))).toBe(
      'Revisá los datos ingresados e intentá de nuevo.'
    );
    expect(toRequestPasswordResetErrorMessage(apiError(429))).toBe(
      'Llegaste al límite de intentos (5 por minuto). Esperá 60 segundos e intentá de nuevo.'
    );
  });

  it('falls back to the normalized core message for server and network errors', () => {
    expect(toRequestPasswordResetErrorMessage(apiError(500))).toBe('Mensaje técnico del core.');
    expect(toRequestPasswordResetErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Intentá de nuevo.'
    );
  });
});

describe('toConfirmPasswordResetErrorMessage', () => {
  it('differentiates expired, reused and invalid tokens', () => {
    expect(toConfirmPasswordResetErrorMessage(apiError(400, 'PASSWORD_RESET_TOKEN_EXPIRED'))).toBe(
      'El enlace de recuperación venció. Solicitá uno nuevo.'
    );
    expect(
      toConfirmPasswordResetErrorMessage(apiError(400, 'PASSWORD_RESET_TOKEN_ALREADY_USED'))
    ).toBe('Este enlace ya fue usado. Solicitá uno nuevo.');
    expect(toConfirmPasswordResetErrorMessage(apiError(400, 'INVALID_PASSWORD_RESET_TOKEN'))).toBe(
      'El enlace de recuperación no es válido. Solicitá uno nuevo.'
    );
  });

  it('classifies token errors for differentiated UI states', () => {
    expect(isPasswordResetTokenError(apiError(400, 'PASSWORD_RESET_TOKEN_EXPIRED'))).toBe(true);
    expect(isPasswordResetTokenError(apiError(400, 'PASSWORD_RESET_TOKEN_ALREADY_USED'))).toBe(
      true
    );
    expect(isPasswordResetTokenError(apiError(400, 'INVALID_PASSWORD_RESET_TOKEN'))).toBe(true);
    expect(isPasswordResetTokenError(apiError(429))).toBe(false);
    expect(isPasswordResetTokenError(new Error('boom'))).toBe(false);
  });

  it('translates validation and rate limit responses', () => {
    expect(toConfirmPasswordResetErrorMessage(apiError(400))).toBe(
      'Revisá los datos ingresados e intentá de nuevo.'
    );
    expect(toConfirmPasswordResetErrorMessage(apiError(422))).toBe(
      'Revisá los datos ingresados e intentá de nuevo.'
    );
    expect(toConfirmPasswordResetErrorMessage(apiError(429))).toBe(
      'Llegaste al límite de intentos (5 por minuto). Esperá 60 segundos e intentá de nuevo.'
    );
  });

  it('falls back to the normalized core message for server and network errors', () => {
    expect(toConfirmPasswordResetErrorMessage(apiError(500))).toBe('Mensaje técnico del core.');
    expect(toConfirmPasswordResetErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Intentá de nuevo.'
    );
  });
});
