import { ApiError } from '@/core/api';
import { UploadCancelledError } from '@/core/media';
import { isNetworkError } from '@/core/network';

export type ProfilePhotoPhase = 'photo' | 'update';

export class ProfilePhotoError extends Error {
  readonly phase: ProfilePhotoPhase;
  override readonly cause: unknown;

  constructor(phase: ProfilePhotoPhase, cause: unknown) {
    super(phase === 'photo' ? 'Photo upload failed' : 'Profile update failed');
    this.name = 'ProfilePhotoError';
    this.phase = phase;
    this.cause = cause;
  }
}

export function toProfilePhotoErrorMessage(error: unknown): string {
  if (error instanceof ProfilePhotoError) {
    return toProfilePhotoErrorMessage(error.cause);
  }
  if (error instanceof UploadCancelledError) {
    return 'Subida cancelada.';
  }
  if (error instanceof Error && error.message.startsWith('Invalid profile photo:')) {
    if (error.message.includes('invalid_type')) {
      return 'El archivo elegido no es una imagen JPEG, PNG o WebP válida.';
    }
    return 'La foto supera los 10 MB. Elegí una imagen más liviana.';
  }
  if (isNetworkError(error)) {
    return 'Sin conexión. Revisá tu red e intentá de nuevo.';
  }
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'MEDIA_NOT_FOUND':
        return 'La foto ya no está disponible. Elegí otra imagen.';
      case 'MEDIA_ALREADY_OWNED':
        return 'Esa imagen ya está vinculada a otro registro. Elegí otra foto.';
      case 'INCOMPATIBLE_OWNER_TYPE':
        return 'Esa imagen no es válida como foto de perfil. Subí una nueva.';
      case 'INVALID_PAYLOAD':
      case 'EMPTY_UPDATE_PAYLOAD':
        return 'No pudimos guardar la foto. Intentá de nuevo.';
      case 'FORBIDDEN':
        return 'No tenés permiso para cambiar esta foto.';
      case 'UNAUTHORIZED':
        return 'Tu sesión venció. Iniciá sesión nuevamente.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Demasiados intentos. Esperá unos segundos e intentá de nuevo.';
      default:
        return 'No pudimos guardar la foto de perfil. Intentá de nuevo.';
    }
  }
  return 'No pudimos guardar la foto de perfil. Intentá de nuevo.';
}
