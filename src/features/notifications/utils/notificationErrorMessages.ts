import { ApiError, toApiErrorMessage } from '@/core/api';

/**
 * Safe, actionable Spanish messages for the push notification contract codes.
 * Falls back to the generic core translation and never surfaces payloads,
 * tokens or `requestId` values.
 */
export function toNotificationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'INVALID_PUSH_TOKEN':
        return 'El token de este dispositivo no es válido. Volvé a activar las notificaciones.';
      case 'INVALID_TIMEZONE':
        return 'No pudimos determinar tu zona horaria. Revisá la configuración del dispositivo.';
      case 'INVALID_UPCOMING_WINDOW':
        return 'La antelación debe estar entre 5 y 1440 minutos.';
      case 'INVALID_QUIET_HOURS':
        return 'Indicá una hora de inicio y una de fin para las horas silenciosas.';
      default:
        return error.message;
    }
  }
  return toApiErrorMessage(error);
}
