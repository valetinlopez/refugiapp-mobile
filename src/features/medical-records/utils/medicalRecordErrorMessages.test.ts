import { ApiError } from '@/core/api';

import {
  CreateMedicalRecordError,
  toCreateMedicalRecordErrorMessage,
  toUpdateMedicalRecordErrorMessage,
  UpdateMedicalRecordError,
} from './medicalRecordErrorMessages';

describe('toCreateMedicalRecordErrorMessage', () => {
  it('translates a 403 to a permission message', () => {
    const error = new ApiError({
      code: 'FORBIDDEN',
      message: 'Forbidden',
      requestId: 'req-1',
      status: 403,
    });
    expect(toCreateMedicalRecordErrorMessage(error)).toBe(
      'Tu rol no tiene permiso para registrar datos clínicos.'
    );
  });

  it('translates VETERINARIAN_INACTIVE conflicts', () => {
    const error = new ApiError({
      code: 'VETERINARIAN_INACTIVE',
      message: 'Veterinarian inactive',
      requestId: 'req-1',
      status: 409,
    });
    expect(toCreateMedicalRecordErrorMessage(error)).toBe(
      'El veterinario seleccionado ya no está activo. Elige otro e inténtalo de nuevo.'
    );
  });

  it('translates a 400 attachment phase to a file message', () => {
    const error = new CreateMedicalRecordError(
      'attachment',
      new ApiError({
        code: 'BAD_REQUEST',
        message: 'Invalid',
        requestId: 'req-1',
        status: 400,
      })
    );
    expect(toCreateMedicalRecordErrorMessage(error)).toBe(
      'Un adjunto no es válido. Elige archivos de hasta 10 MB e inténtalo de nuevo.'
    );
  });

  it('translates OCCURRED_AT_IN_FUTURE to a future date message', () => {
    const error = new ApiError({
      code: 'OCCURRED_AT_IN_FUTURE',
      message: 'Occurred at is in the future',
      requestId: 'req-1',
      status: 422,
    });
    expect(toCreateMedicalRecordErrorMessage(error)).toBe('La fecha y hora no puede ser futura.');
  });

  it('translates OCCURRED_AT_BEFORE_INTAKE to a before-intake message', () => {
    const error = new ApiError({
      code: 'OCCURRED_AT_BEFORE_INTAKE',
      message: 'Occurred at is before intake',
      requestId: 'req-1',
      status: 400,
    });
    expect(toCreateMedicalRecordErrorMessage(error)).toBe(
      'La fecha y hora no puede ser anterior al ingreso del animal.'
    );
  });

  it('falls back to a safe message for unknown errors', () => {
    expect(toCreateMedicalRecordErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Inténtalo de nuevo.'
    );
  });
});

describe('toUpdateMedicalRecordErrorMessage', () => {
  it('translates a 404 to a missing record message', () => {
    const error = new ApiError({
      code: 'NOT_FOUND',
      message: 'Not found',
      requestId: 'req-1',
      status: 404,
    });
    expect(toUpdateMedicalRecordErrorMessage(error)).toBe(
      'El registro clínico ya no está disponible.'
    );
  });

  it('translates a 403 to a permission message', () => {
    const error = new ApiError({
      code: 'FORBIDDEN',
      message: 'Forbidden',
      requestId: 'req-1',
      status: 403,
    });
    expect(toUpdateMedicalRecordErrorMessage(error)).toBe(
      'Tu rol no tiene permiso para editar datos clínicos.'
    );
  });

  it('translates an attachment phase failure to a file message', () => {
    const error = new UpdateMedicalRecordError(
      'attachment',
      new ApiError({
        code: 'BAD_REQUEST',
        message: 'Invalid',
        requestId: 'req-1',
        status: 400,
      })
    );
    expect(toUpdateMedicalRecordErrorMessage(error)).toBe(
      'Un adjunto no es válido. Elige archivos de hasta 10 MB e inténtalo de nuevo.'
    );
  });

  it('translates OCCURRED_AT_IN_FUTURE to a future date message', () => {
    const error = new ApiError({
      code: 'OCCURRED_AT_IN_FUTURE',
      message: 'Occurred at is in the future',
      requestId: 'req-1',
      status: 422,
    });
    expect(toUpdateMedicalRecordErrorMessage(error)).toBe('La fecha y hora no puede ser futura.');
  });

  it('translates OCCURRED_AT_BEFORE_INTAKE to a before-intake message', () => {
    const error = new ApiError({
      code: 'OCCURRED_AT_BEFORE_INTAKE',
      message: 'Occurred at is before intake',
      requestId: 'req-1',
      status: 400,
    });
    expect(toUpdateMedicalRecordErrorMessage(error)).toBe(
      'La fecha y hora no puede ser anterior al ingreso del animal.'
    );
  });

  it('falls back to a safe message for unknown errors', () => {
    expect(toUpdateMedicalRecordErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Inténtalo de nuevo.'
    );
  });
});
