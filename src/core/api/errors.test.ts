import {
  ApiError,
  createResponseError,
  normalizeTransportError,
  toApiErrorMessage,
} from './errors';

const headers = { get: () => null };

describe('normalized API errors', () => {
  it.each([
    [400, 'La solicitud contiene datos inválidos.'],
    [401, 'Tu sesión venció. Iniciá sesión nuevamente.'],
    [403, 'No tenés permiso para realizar esta acción.'],
    [404, 'No encontramos el recurso solicitado.'],
    [409, 'La operación entra en conflicto con el estado actual.'],
    [422, 'No pudimos procesar los datos enviados.'],
    [500, 'Ocurrió un error en el servidor. Intentá nuevamente.'],
  ])('maps HTTP %i to a safe actionable Spanish message', (status, expectedMessage) => {
    const error = createResponseError(status, {}, headers, 'local-request-id');

    expect(error).toMatchObject({
      message: expectedMessage,
      requestId: 'local-request-id',
      status,
    });
  });

  it('uses a safe generic message for unmapped statuses', () => {
    const error = createResponseError(418, {}, headers, 'local-request-id');

    expect(error.message).toBe('No pudimos completar la solicitud.');
    expect(error.code).toBe('HTTP_418');
  });

  it('preserves safe backend codes and correlation IDs', () => {
    const error = createResponseError(
      409,
      { code: 'RESOURCE_CONFLICT', requestId: 'backend-request-id' },
      headers,
      'local-request-id'
    );

    expect(error.code).toBe('RESOURCE_CONFLICT');
    expect(error.requestId).toBe('backend-request-id');
  });

  it('differentiates network failure from request timeout', () => {
    const network = normalizeTransportError(new Error('fetch failed'), 'req-1');
    const timeout = normalizeTransportError(
      Object.assign(new Error('aborted'), { name: 'AbortError' }),
      'req-2'
    );

    expect(network).toMatchObject({
      code: 'NETWORK_ERROR',
      message: 'No pudimos conectar con el servicio. Revisá tu conexión.',
      status: 0,
    });
    expect(timeout).toMatchObject({
      code: 'REQUEST_TIMEOUT',
      message: 'La solicitud tardó demasiado. Intentá nuevamente.',
      status: 0,
    });
  });
});

describe('safe error messages never leak internals', () => {
  it('does not include backend bodies, tokens or correlation IDs in the message', () => {
    const error = createResponseError(
      500,
      {
        code: 'INTERNAL',
        requestId: 'secret-request-id',
        token: 'secret-access-token',
        authorization: 'Bearer secret',
        message: 'Query failed with stack: at internal.ts:12',
      },
      headers,
      'local-request-id'
    );

    expect(error.message).toBe('Ocurrió un error en el servidor. Intentá nuevamente.');
    expect(error.message).not.toMatch(/Bearer|secret|token|stack/i);
    expect(error.message).not.toContain('local-request-id');
  });

  it('translates unknown errors to a generic safe message', () => {
    expect(toApiErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Intentá de nuevo.'
    );
    expect(toApiErrorMessage(null)).toBe('Ocurrió un error inesperado. Intentá de nuevo.');
    expect(toApiErrorMessage(undefined)).toBe('Ocurrió un error inesperado. Intentá de nuevo.');
  });

  it('returns the normalized message for ApiError instances', () => {
    const error = new ApiError({
      code: 'FORBIDDEN',
      message: 'No tenés permiso para realizar esta acción.',
      requestId: 'req-1',
      status: 403,
    });

    expect(toApiErrorMessage(error)).toBe('No tenés permiso para realizar esta acción.');
  });
});
