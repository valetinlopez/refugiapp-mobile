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
