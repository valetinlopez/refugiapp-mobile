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

const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export function inferMimeTypeFromName(name: string): string | null {
  const withoutQuery = name.split('?')[0] ?? name;
  const extension = withoutQuery.split('.').pop()?.toLowerCase() ?? '';
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'pdf':
      return 'application/pdf';
    default:
      return null;
  }
}

export function resolveMediaMimeType(
  name: string,
  mimeType: string | null | undefined,
  fallback = 'image/jpeg'
): string {
  const normalized = mimeType?.toLowerCase();
  if (normalized) return normalized;
  return inferMimeTypeFromName(name) ?? fallback;
}

export function normalizeMediaFileName(name: string, mimeType: string): string {
  const extension = MIME_TYPE_EXTENSIONS[mimeType];
  if (extension === undefined) return name;
  const withoutQuery = name.split('?')[0] ?? name;
  const lastSlash = withoutQuery.lastIndexOf('/');
  const lastDot = withoutQuery.lastIndexOf('.');
  const hasExtension = lastDot > lastSlash;
  if (hasExtension) {
    const currentExtension = withoutQuery.slice(lastDot).toLowerCase();
    return currentExtension === extension
      ? withoutQuery
      : `${withoutQuery.slice(0, lastDot)}${extension}`;
  }
  return `${withoutQuery}${extension}`;
}

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
