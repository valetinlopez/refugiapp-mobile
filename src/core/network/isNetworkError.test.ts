import { ApiError } from '../api/errors';

import { isNetworkError } from './isNetworkError';

function apiError(code: string): ApiError {
  return new ApiError({ code, message: code, requestId: 'request-id', status: 0 });
}

describe('isNetworkError', () => {
  it.each(['NETWORK_ERROR', 'REQUEST_TIMEOUT'])('matches %s', (code) => {
    expect(isNetworkError(apiError(code))).toBe(true);
  });

  it.each(['SESSION_EXPIRED', 'HTTP_404', 'HTTP_500'])('rejects %s', (code) => {
    expect(isNetworkError(apiError(code))).toBe(false);
  });

  it.each([new Error('offline'), null, undefined, 'NETWORK_ERROR', { code: 'NETWORK_ERROR' }])(
    'rejects non-ApiError values',
    (value) => {
      expect(isNetworkError(value)).toBe(false);
    }
  );
});
