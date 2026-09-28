import { ApiError } from '@/core/api';

export function toAnimalOptionsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return error.message;
      case 400:
      case 422:
        return 'El servidor rechazó la consulta de animales. Reintentá o volvé a la pantalla anterior.';
      case 403:
        return 'Tu rol no tiene permiso para consultar los animales.';
      case 404:
        return 'No encontramos el animal seleccionado.';
      default:
        return error.message;
    }
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
