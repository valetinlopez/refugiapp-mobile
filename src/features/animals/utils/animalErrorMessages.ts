import { ApiError } from '@/core/api';

export type CreateAnimalPhase = 'photo' | 'create';

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

function unwrap(error: unknown): { phase: CreateAnimalPhase; root: unknown } {
  if (error instanceof CreateAnimalError) {
    return { phase: error.phase, root: error.rootError };
  }
  return { phase: 'create', root: error };
}

export function toCreateAnimalErrorMessage(error: unknown): string {
  const { phase, root } = unwrap(error);

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
