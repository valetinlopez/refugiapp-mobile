export interface MediaFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  file?: Blob;
}

export const MAX_MEDIA_FILE_BYTES = 10 * 1024 * 1024;
export const IMAGE_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const DOCUMENT_MEDIA_TYPES = [...IMAGE_MEDIA_TYPES, 'application/pdf'] as const;

export type MediaFileValidationError = 'file_too_large' | 'invalid_type' | 'missing_size';

export class UploadCancelledError extends Error {
  constructor() {
    super('Upload cancelled');
    this.name = 'UploadCancelledError';
  }
}

export function validateMediaFile(
  file: MediaFile,
  allowedMimeTypes: readonly string[],
  options: { requireSize?: boolean } = {}
): MediaFileValidationError | null {
  const normalizedMimeType = file.mimeType.toLowerCase();

  if (!allowedMimeTypes.includes(normalizedMimeType)) {
    return 'invalid_type';
  }
  if (file.size === undefined && options.requireSize === true) {
    return 'missing_size';
  }
  if (file.size !== undefined && file.size > MAX_MEDIA_FILE_BYTES) {
    return 'file_too_large';
  }
  return null;
}
