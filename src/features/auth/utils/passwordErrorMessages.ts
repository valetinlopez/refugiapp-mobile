import { ApiError, toApiErrorMessage } from '@/core/api';

const RATE_LIMIT_MESSAGE =
  'Se realizaron demasiados intentos. Esperá un momento e intentá de nuevo.';
const INVALID_DATA_MESSAGE = 'Revisá los datos ingresados e intentá de nuevo.';

export function isPasswordResetTokenError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === 'PASSWORD_RESET_TOKEN_EXPIRED' ||
      error.code === 'PASSWORD_RESET_TOKEN_ALREADY_USED' ||
      error.code === 'INVALID_PASSWORD_RESET_TOKEN')
  );
}

export function toChangePasswordErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_CURRENT_PASSWORD') {
      return 'La contraseña actual no es correcta. Intentá de nuevo.';
    }
    switch (error.status) {
      case 400:
      case 422:
        return INVALID_DATA_MESSAGE;
      case 429:
        return RATE_LIMIT_MESSAGE;
      default:
        return toApiErrorMessage(error);
    }
  }
  return toApiErrorMessage(error);
}

export function toRequestPasswordResetErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return INVALID_DATA_MESSAGE;
      case 429:
        return RATE_LIMIT_MESSAGE;
      default:
        return toApiErrorMessage(error);
    }
  }
  return toApiErrorMessage(error);
}

export function toConfirmPasswordResetErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'PASSWORD_RESET_TOKEN_EXPIRED':
        return 'El enlace de recuperación venció. Solicitá uno nuevo.';
      case 'PASSWORD_RESET_TOKEN_ALREADY_USED':
        return 'Este enlace ya fue usado. Solicitá uno nuevo.';
      case 'INVALID_PASSWORD_RESET_TOKEN':
        return 'El enlace de recuperación no es válido. Solicitá uno nuevo.';
    }
    switch (error.status) {
      case 400:
      case 422:
        return INVALID_DATA_MESSAGE;
      case 429:
        return RATE_LIMIT_MESSAGE;
      default:
        return toApiErrorMessage(error);
    }
  }
  return toApiErrorMessage(error);
}
