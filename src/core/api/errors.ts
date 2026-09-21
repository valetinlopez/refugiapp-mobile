import type { HttpTransportResponse } from './client';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'La solicitud contiene datos inválidos.',
  401: 'Tu sesión venció. Inicia sesión nuevamente.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No encontramos el recurso solicitado.',
  409: 'La operación entra en conflicto con el estado actual.',
  422: 'No pudimos procesar los datos enviados.',
  429: 'Se realizaron demasiados intentos. Espera un momento.',
  500: 'Ocurrió un error en el servidor. Intenta nuevamente.',
  502: 'El servicio no está disponible temporalmente.',
  503: 'El servicio no está disponible temporalmente.',
  504: 'El servicio tardó demasiado en responder.',
};

interface ApiErrorOptions {
  code: string;
  message: string;
  requestId: string;
  status: number;
}

export class ApiError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly status: number;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.code = options.code;
    this.requestId = options.requestId;
    this.status = options.status;
  }
}

interface BackendErrorBody {
  code?: unknown;
  requestId?: unknown;
}

export function createResponseError(
  status: number,
  body: unknown,
  headers: HttpTransportResponse['headers'],
  fallbackRequestId: string
): ApiError {
  const backendError =
    typeof body === 'object' && body !== null ? (body as BackendErrorBody) : undefined;
  const headerRequestId = headers.get('x-request-id');
  const requestId =
    typeof backendError?.requestId === 'string'
      ? backendError.requestId
      : (headerRequestId ?? fallbackRequestId);
  const code =
    typeof backendError?.code === 'string' ? backendError.code : `HTTP_${String(status)}`;

  return new ApiError({
    code,
    message: STATUS_MESSAGES[status] ?? 'No pudimos completar la solicitud.',
    requestId,
    status,
  });
}

export function normalizeTransportError(error: unknown, requestId: string): ApiError {
  const isAbort = error instanceof Error && error.name === 'AbortError';
  return new ApiError({
    code: isAbort ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
    message: isAbort
      ? 'La solicitud tardó demasiado. Intenta nuevamente.'
      : 'No pudimos conectar con el servicio. Revisa tu conexión.',
    requestId,
    status: 0,
  });
}
