import type { HttpTransportResponse } from './client';

/**
 * Mapa de estados HTTP a mensajes accionables en español (rioplatense).
 * Nunca interpolan detalles del servidor: `createResponseError` solo preserva
 * `code` y `requestId` en el objeto `ApiError`, no en el mensaje visible.
 */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'La solicitud contiene datos inválidos.',
  401: 'Tu sesión venció. Iniciá sesión nuevamente.',
  403: 'No tenés permiso para realizar esta acción.',
  404: 'No encontramos el recurso solicitado.',
  409: 'La operación entra en conflicto con el estado actual.',
  422: 'No pudimos procesar los datos enviados.',
  429: 'Se realizaron demasiados intentos. Esperá un momento.',
  500: 'Ocurrió un error en el servidor. Intentá nuevamente.',
  502: 'El servicio no está disponible temporalmente.',
  503: 'El servicio no está disponible temporalmente.',
  504: 'El servicio tardó demasiado en responder.',
};

const GENERIC_ERROR_MESSAGE = 'No pudimos completar la solicitud.';
const UNEXPECTED_ERROR_MESSAGE = 'Ocurrió un error inesperado. Intentá de nuevo.';

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
    message: STATUS_MESSAGES[status] ?? GENERIC_ERROR_MESSAGE,
    requestId,
    status,
  });
}

/**
 * Diferencia fallos de transporte: timeout/abort (`REQUEST_TIMEOUT`) versus
 * falta de conexión (`NETWORK_ERROR`). El status 0 identifica ambos casos; el
 * `code` permite a la UI distinguirlos si necesita presentarlos por separado.
 */
export function normalizeTransportError(error: unknown, requestId: string): ApiError {
  const isAbort = error instanceof Error && error.name === 'AbortError';
  return new ApiError({
    code: isAbort ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
    message: isAbort
      ? 'La solicitud tardó demasiado. Intentá nuevamente.'
      : 'No pudimos conectar con el servicio. Revisá tu conexión.',
    requestId,
    status: 0,
  });
}

/**
 * Traducción segura de cualquier error a un mensaje accionable en español.
 * Un `ApiError` ya trae un mensaje normalizado sin detalles internos; cualquier
 * otra cosa cae en un mensaje genérico que nunca filtra payloads ni secretos.
 * Las features lo usan como fallback final y lo especializan por código/dominio.
 */
export function toApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return UNEXPECTED_ERROR_MESSAGE;
}
