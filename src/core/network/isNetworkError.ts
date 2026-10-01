import { ApiError } from '../api/errors';

const NETWORK_ERROR_CODES = new Set(['NETWORK_ERROR', 'REQUEST_TIMEOUT']);

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && NETWORK_ERROR_CODES.has(error.code);
}
