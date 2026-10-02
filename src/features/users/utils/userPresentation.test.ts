import { ApiError } from '@/core/api';

import { toUserErrorMessage } from './userPresentation';

describe('toUserErrorMessage', () => {
  it('translates an email conflict into an actionable message', () => {
    const error = new ApiError({
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Email is already registered.',
      requestId: 'request-id',
      status: 409,
    });

    expect(toUserErrorMessage(error)).toBe('Ya existe un usuario registrado con ese email.');
  });

  it('translates last-admin protection into an actionable message', () => {
    const error = new ApiError({
      code: 'LAST_ADMIN_FORBIDDEN',
      message: 'Cannot remove the admin role from the last active admin.',
      requestId: 'request-id',
      status: 409,
    });

    expect(toUserErrorMessage(error)).toBe(
      'No se puede quitar el rol de administrador al último administrador activo.'
    );
  });

  it('translates empty or invalid update payloads', () => {
    const error = new ApiError({
      code: 'EMPTY_UPDATE_PAYLOAD',
      message: 'Provide at least one field to update.',
      requestId: 'request-id',
      status: 400,
    });

    expect(toUserErrorMessage(error)).toBe(
      'Revisá los datos ingresados. No hay cambios válidos para guardar.'
    );
  });

  it('does not expose unknown backend details', () => {
    const error = new ApiError({
      code: 'INTERNAL_ERROR',
      message: 'Sensitive internal detail',
      requestId: 'request-id',
      status: 500,
    });

    expect(toUserErrorMessage(error)).toBe(
      'No pudimos completar la operación. Intentá nuevamente.'
    );
  });
});
