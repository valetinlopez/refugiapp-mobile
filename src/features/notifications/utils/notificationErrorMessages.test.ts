import { ApiError } from '@/core/api';

import { toNotificationErrorMessage } from './notificationErrorMessages';

function apiError(code: string, status = 400): ApiError {
  return new ApiError({ code, message: 'raw message', requestId: 'req-1', status });
}

describe('toNotificationErrorMessage', () => {
  it.each([
    ['INVALID_PUSH_TOKEN', /token/i],
    ['INVALID_TIMEZONE', /zona horaria/i],
    ['INVALID_UPCOMING_WINDOW', /5 y 1440/],
    ['INVALID_QUIET_HOURS', /hora de inicio/i],
  ])('maps %s to an actionable message', (code, pattern) => {
    expect(toNotificationErrorMessage(apiError(code))).toMatch(pattern);
  });

  it('falls back to the normalized ApiError message', () => {
    expect(toNotificationErrorMessage(apiError('SOMETHING_ELSE'))).toBe('raw message');
  });

  it('returns a safe message for unknown errors', () => {
    expect(toNotificationErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Intentá de nuevo.'
    );
  });
});
