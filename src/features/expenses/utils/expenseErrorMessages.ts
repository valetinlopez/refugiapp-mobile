import { ApiError, toApiErrorMessage } from '@/core/api';
import { UploadCancelledError } from '@/core/media';

export function toCreateExpenseErrorMessage(error: unknown): string {
  if (error instanceof UploadCancelledError) {
    return 'La subida fue cancelada. El comprobante no se guardó.';
  }

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return 'Revisá los datos del gasto o el comprobante e intentá de nuevo.';
      case 403:
        return 'Tu rol no tiene permiso para registrar gastos.';
      case 404:
        return 'El animal o el comprobante ya no están disponibles.';
      case 409:
        return 'El comprobante ya está vinculado a otro gasto. Elegí otro archivo e intentá de nuevo.';
      default:
        return toApiErrorMessage(error);
    }
  }

  return toApiErrorMessage(error);
}
