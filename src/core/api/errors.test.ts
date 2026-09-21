import { createResponseError } from './errors';

const headers = { get: () => null };

describe('normalized API errors', () => {
  it.each([
    [400, 'La solicitud contiene datos inválidos.'],
    [401, 'Tu sesión venció. Inicia sesión nuevamente.'],
    [403, 'No tienes permiso para realizar esta acción.'],
    [404, 'No encontramos el recurso solicitado.'],
    [409, 'La operación entra en conflicto con el estado actual.'],
    [422, 'No pudimos procesar los datos enviados.'],
    [500, 'Ocurrió un error en el servidor. Intenta nuevamente.'],
  ])('maps HTTP %i to a safe Spanish message', (status, expectedMessage) => {
    const error = createResponseError(status, {}, headers, 'local-request-id');

    expect(error).toMatchObject({
      message: expectedMessage,
      requestId: 'local-request-id',
      status,
    });
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
});
