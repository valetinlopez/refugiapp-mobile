import { ApiError } from '@/core/api';

import { toCreateUserErrorMessage, toUserErrorMessage } from './userPresentation';

describe('toCreateUserErrorMessage', () => {
  it.each([
    [
      new ApiError({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email exists.',
        requestId: 'request-id',
        status: 409,
      }),
      'Ya existe un usuario registrado con ese email.',
    ],
    [
      new ApiError({
        code: 'HTTP_403',
        message: 'Forbidden.',
        requestId: 'request-id',
        status: 403,
      }),
      'Tu rol no tiene permiso para crear usuarios.',
    ],
    [
      new ApiError({
        code: 'INVALID_PAYLOAD',
        message: 'Invalid.',
        requestId: 'request-id',
        status: 400,
      }),
      'Revisá el email, la contraseña y los roles seleccionados.',
    ],
    [
      new ApiError({
        code: 'NETWORK_ERROR',
        message: 'Network.',
        requestId: 'request-id',
        status: 0,
      }),
      'Sin conexión. Revisá tu conexión y volvé a intentar.',
    ],
  ])('distinguishes create-user failures', (error, expected) => {
    expect(toCreateUserErrorMessage(error)).toBe(expected);
  });
});

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
