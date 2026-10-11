import { ApiError, toApiErrorMessage } from '@/core/api';

/**
 * Safe, actionable messages for the Inicio summary queries (D36 / RFG-169).
 * Never exposes payloads, tokens, request ids or clinical data.
 */
export function toHomeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return error.message;
      case 401:
        return 'Tu sesión expiró. Volvé a iniciar sesión.';
      case 403:
        return 'Tu rol no tiene permiso para consultar este resumen.';
      default:
        return error.message;
    }
  }
  return toApiErrorMessage(error);
}
