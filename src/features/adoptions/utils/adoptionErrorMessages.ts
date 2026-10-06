import { ApiError, toApiErrorMessage } from '@/core/api';

export class CreateApplicationError extends Error {
  readonly adopterId: string;
  readonly rootError: unknown;

  constructor(rootError: unknown, adopterId: string) {
    super('The adopter was created but the application could not be registered.');
    this.name = 'CreateApplicationError';
    this.rootError = rootError;
    this.adopterId = adopterId;
  }
}

export function toCreateApplicationErrorMessage(error: unknown): string {
  if (error instanceof CreateApplicationError) {
    if (error.rootError instanceof ApiError) {
      switch (error.rootError.status) {
        case 400:
        case 422:
          return 'El contacto quedó registrado, pero la postulación contiene datos inválidos.';
        case 403:
          return 'El contacto quedó registrado, pero tu rol no permite crear la postulación.';
        case 404:
          return 'El contacto quedó registrado, pero el animal ya no está disponible.';
        case 409:
          return 'El contacto quedó registrado, pero ya existe una postulación pendiente o el animal no está disponible para adopción.';
        default:
          return 'El contacto quedó registrado, pero no pudimos crear la postulación. Podés reintentar sin duplicar el contacto.';
      }
    }
    return 'El contacto quedó registrado, pero no pudimos crear la postulación. Podés reintentar sin duplicar el contacto.';
  }

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return 'Revisá los datos del adoptante e intentá de nuevo.';
      case 403:
        return 'Tu rol no tiene permiso para registrar postulaciones.';
      case 404:
        return 'El animal ya no está disponible.';
      case 409:
        return 'Ya existe un adoptante con ese email. El backend todavía no permite buscarlo para reutilizarlo.';
      default:
        return error.message;
    }
  }

  return toApiErrorMessage(error);
}

export function toApproveAdoptionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return 'La fecha o los datos de aprobación no son válidos.';
      case 403:
        return 'Tu rol no tiene permiso para aprobar adopciones.';
      case 404:
        return 'La postulación o el animal ya no están disponibles.';
      case 409:
        return 'La postulación ya fue resuelta o el animal dejó de estar disponible para adopción.';
      default:
        return error.message;
    }
  }
  return toApiErrorMessage(error);
}
