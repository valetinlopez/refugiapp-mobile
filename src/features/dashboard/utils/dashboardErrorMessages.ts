import { ApiError } from '@/core/api';

export function toDashboardErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'Tu sesión expiró. Volvé a iniciar sesión.';
      case 403:
        return 'Tu rol no tiene permiso para ver el panel.';
      case 404:
        return 'El panel todavía no tiene información disponible.';
      default:
        return error.message;
    }
  }
  return 'No pudimos cargar el panel. Revisá tu conexión e inténtalo de nuevo.';
}
