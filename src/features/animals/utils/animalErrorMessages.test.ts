import { ApiError } from '@/core/api';

import {
  CreateAnimalError,
  toChangeStatusErrorMessage,
  toCreateAnimalErrorMessage,
  toUpdateAnimalErrorMessage,
  UpdateAnimalError,
} from './animalErrorMessages';

function apiError(status: number): ApiError {
  return new ApiError({
    code: `HTTP_${String(status)}`,
    message: 'Mensaje técnico del core.',
    requestId: 'request-id',
    status,
  });
}

describe('toCreateAnimalErrorMessage', () => {
  it('translates validation failures during creation', () => {
    expect(toCreateAnimalErrorMessage(new CreateAnimalError('create', apiError(422)))).toBe(
      'Revisa los datos del formulario e inténtalo de nuevo.'
    );
  });

  it('translates photo upload failures with photo guidance', () => {
    expect(toCreateAnimalErrorMessage(new CreateAnimalError('photo', apiError(400)))).toBe(
      'La foto no es válida. Elige una imagen de hasta 10 MB e inténtalo de nuevo.'
    );
  });

  it('translates forbidden access for the veterinarian role', () => {
    expect(toCreateAnimalErrorMessage(apiError(403))).toBe(
      'Tu rol no tiene permiso para dar de alta animales.'
    );
  });

  it('guides re-selecting the photo when the orphan asset is gone', () => {
    expect(toCreateAnimalErrorMessage(apiError(404))).toBe(
      'La foto seleccionada ya no está disponible. Vuelve a elegirla e inténtalo de nuevo.'
    );
  });

  it('explains already-linked photo conflicts', () => {
    expect(toCreateAnimalErrorMessage(apiError(409))).toBe(
      'La foto ya está vinculada a otro registro. Elige otra foto e inténtalo de nuevo.'
    );
  });

  it('keeps the core Spanish message for transport and server errors', () => {
    expect(toCreateAnimalErrorMessage(apiError(0))).toBe('Mensaje técnico del core.');
    expect(toCreateAnimalErrorMessage(apiError(500))).toBe('Mensaje técnico del core.');
  });

  it('falls back to a safe message for unknown errors', () => {
    expect(toCreateAnimalErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Inténtalo de nuevo.'
    );
    expect(toCreateAnimalErrorMessage(null)).toBe(
      'Ocurrió un error inesperado. Inténtalo de nuevo.'
    );
  });
});

describe('toUpdateAnimalErrorMessage', () => {
  it('translates forbidden access for editing', () => {
    expect(toUpdateAnimalErrorMessage(apiError(403))).toBe(
      'Tu rol no tiene permiso para editar animales.'
    );
  });

  it('translates a missing animal', () => {
    expect(toUpdateAnimalErrorMessage(apiError(404))).toBe('El animal ya no está disponible.');
  });

  it('guides re-selecting the photo when the orphan asset is gone', () => {
    expect(toUpdateAnimalErrorMessage(new UpdateAnimalError('photo', apiError(404)))).toBe(
      'La foto seleccionada ya no está disponible. Vuelve a elegirla e inténtalo de nuevo.'
    );
  });

  it('translates photo conflicts during update', () => {
    expect(toUpdateAnimalErrorMessage(new UpdateAnimalError('photo', apiError(409)))).toBe(
      'La foto ya está vinculada a otro registro. Elige otra foto e inténtalo de nuevo.'
    );
  });

  it('keeps the backend message for non-photo update conflicts', () => {
    expect(toUpdateAnimalErrorMessage(apiError(409))).toBe('Mensaje técnico del core.');
  });

  it('translates validation failures during update', () => {
    expect(toUpdateAnimalErrorMessage(new UpdateAnimalError('update', apiError(422)))).toBe(
      'Revisa los datos del formulario e inténtalo de nuevo.'
    );
  });

  it('falls back to a safe message for unknown errors', () => {
    expect(toUpdateAnimalErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Inténtalo de nuevo.'
    );
  });
});

describe('toChangeStatusErrorMessage', () => {
  it('translates forbidden access for status changes', () => {
    expect(toChangeStatusErrorMessage(apiError(403))).toBe(
      'Tu rol no tiene permiso para cambiar el estado del animal.'
    );
  });

  it('translates invalid transitions as conflicts', () => {
    expect(toChangeStatusErrorMessage(apiError(409))).toBe(
      'No se puede pasar a este estado desde el estado actual.'
    );
  });

  it('translates a missing animal', () => {
    expect(toChangeStatusErrorMessage(apiError(404))).toBe('El animal ya no está disponible.');
  });

  it('keeps the backend message for server errors', () => {
    expect(toChangeStatusErrorMessage(apiError(500))).toBe('Mensaje técnico del core.');
  });

  it('falls back to a safe message for unknown errors', () => {
    expect(toChangeStatusErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Inténtalo de nuevo.'
    );
  });
});
