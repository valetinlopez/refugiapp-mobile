import { ApiError } from '@/core/api';
import { UploadCancelledError } from '@/core/media';

export type CreateAnimalPhase = 'photo' | 'create';
export type UpdateAnimalPhase = 'photo' | 'update';

export class CreateAnimalError extends Error {
  readonly phase: CreateAnimalPhase;
  readonly rootError: unknown;

  constructor(phase: CreateAnimalPhase, rootError: unknown) {
    super('No pudimos completar el alta del animal.');
    this.name = 'CreateAnimalError';
    this.phase = phase;
    this.rootError = rootError;
  }
}

export class UpdateAnimalError extends Error {
  readonly phase: UpdateAnimalPhase;
  readonly rootError: unknown;

  constructor(phase: UpdateAnimalPhase, rootError: unknown) {
    super('No pudimos guardar los cambios del animal.');
    this.name = 'UpdateAnimalError';
    this.phase = phase;
    this.rootError = rootError;
  }
}

function unwrap(error: unknown): { phase: CreateAnimalPhase; root: unknown } {
  if (error instanceof CreateAnimalError) {
    return { phase: error.phase, root: error.rootError };
  }
  return { phase: 'create', root: error };
}

function unwrapUpdate(error: unknown): { phase: UpdateAnimalPhase; root: unknown } {
  if (error instanceof UpdateAnimalError) {
    return { phase: error.phase, root: error.rootError };
  }
  return { phase: 'update', root: error };
}

export function toCreateAnimalErrorMessage(error: unknown): string {
  const { phase, root } = unwrap(error);

  if (root instanceof UploadCancelledError) {
    return 'La subida de la foto fue cancelada.';
  }

  if (root instanceof ApiError) {
    if (root.status === 400 || root.status === 422) {
      return phase === 'photo'
        ? 'La foto no es válida. Elige una imagen de hasta 10 MB e inténtalo de nuevo.'
        : 'Revisa los datos del formulario e inténtalo de nuevo.';
    }

    switch (root.status) {
      case 403:
        return 'Tu rol no tiene permiso para dar de alta animales.';
      case 404:
        return 'La foto seleccionada ya no está disponible. Vuelve a elegirla e inténtalo de nuevo.';
      case 409:
        return 'La foto ya está vinculada a otro registro. Elige otra foto e inténtalo de nuevo.';
      default:
        return root.message;
    }
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

export function toUpdateAnimalErrorMessage(error: unknown): string {
  const { phase, root } = unwrapUpdate(error);

  if (root instanceof UploadCancelledError) {
    return 'La subida de la foto fue cancelada.';
  }

  if (root instanceof ApiError) {
    if (root.status === 400 || root.status === 422) {
      return phase === 'photo'
        ? 'La foto no es válida. Elige una imagen de hasta 10 MB e inténtalo de nuevo.'
        : 'Revisa los datos del formulario e inténtalo de nuevo.';
    }

    switch (root.status) {
      case 403:
        return 'Tu rol no tiene permiso para editar animales.';
      case 404:
        return phase === 'photo'
          ? 'La foto seleccionada ya no está disponible. Vuelve a elegirla e inténtalo de nuevo.'
          : 'El animal ya no está disponible.';
      case 409:
        return phase === 'photo'
          ? 'La foto ya está vinculada a otro registro. Elige otra foto e inténtalo de nuevo.'
          : root.message;
      default:
        return root.message;
    }
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

export function toChangeStatusErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 403:
        return 'Tu rol no tiene permiso para cambiar el estado del animal.';
      case 404:
        return 'El animal ya no está disponible.';
      case 409:
        return 'No se puede pasar a este estado desde el estado actual.';
      default:
        return error.message;
    }
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

export function toCreateAnimalEventErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return 'Revisa el tipo, la descripción y la fecha del evento.';
      case 403:
        return 'Tu rol no tiene permiso para registrar eventos generales.';
      case 404:
        return 'El animal ya no está disponible.';
      default:
        return error.message;
    }
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
