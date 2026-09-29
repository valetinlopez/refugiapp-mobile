import { ApiError } from '@/core/api';
import { UploadCancelledError } from '@/core/media';

import { toCreateExpenseErrorMessage } from './expenseErrorMessages';

function apiError(status: number): ApiError {
  return new ApiError({
    code: `HTTP_${status}`,
    message: 'Mensaje técnico del core.',
    requestId: 'req-1',
    status,
  });
}

describe('toCreateExpenseErrorMessage', () => {
  it('translates validation errors to actionable Spanish', () => {
    expect(toCreateExpenseErrorMessage(apiError(400))).toBe(
      'Revisá los datos del gasto o el comprobante e intentá de nuevo.'
    );
    expect(toCreateExpenseErrorMessage(apiError(422))).toBe(
      'Revisá los datos del gasto o el comprobante e intentá de nuevo.'
    );
  });

  it('translates a 403 to a permission message', () => {
    expect(toCreateExpenseErrorMessage(apiError(403))).toBe(
      'Tu rol no tiene permiso para registrar gastos.'
    );
  });

  it('translates a 404 to a missing resource message', () => {
    expect(toCreateExpenseErrorMessage(apiError(404))).toBe(
      'El animal o el comprobante ya no están disponibles.'
    );
  });

  it('translates a 409 to a linked receipt message', () => {
    expect(toCreateExpenseErrorMessage(apiError(409))).toBe(
      'El comprobante ya está vinculado a otro gasto. Elegí otro archivo e intentá de nuevo.'
    );
  });

  it('translates an upload cancellation without leaking internals', () => {
    expect(toCreateExpenseErrorMessage(new UploadCancelledError())).toBe(
      'La subida fue cancelada. El comprobante no se guardó.'
    );
  });

  it('falls back to the normalized core message for server and network errors', () => {
    expect(toCreateExpenseErrorMessage(apiError(500))).toBe('Mensaje técnico del core.');
    expect(toCreateExpenseErrorMessage(apiError(0))).toBe('Mensaje técnico del core.');
  });

  it('falls back to a safe generic message for unknown errors', () => {
    expect(toCreateExpenseErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado. Intentá de nuevo.'
    );
    expect(toCreateExpenseErrorMessage(null)).toBe(
      'Ocurrió un error inesperado. Intentá de nuevo.'
    );
  });
});
