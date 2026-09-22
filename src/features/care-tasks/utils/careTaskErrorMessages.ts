import { ApiError } from '@/core/api';

export function toCareTaskErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return 'Revisá los datos de la tarea e inténtalo de nuevo.';
      case 403:
        return 'Tu rol no tiene permiso para realizar esta acción.';
      case 404:
        return 'La tarea o el animal ya no están disponibles.';
      case 409:
        return 'La tarea ya fue completada o cancelada.';
      default:
        return error.message;
    }
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
