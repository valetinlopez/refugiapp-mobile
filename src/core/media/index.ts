export {
  DOCUMENT_MEDIA_TYPES,
  IMAGE_MEDIA_TYPES,
  MAX_MEDIA_FILE_BYTES,
  validateMediaFile,
  inferMimeTypeFromName,
  normalizeMediaFileName,
  resolveMediaMimeType,
} from './fileValidation';
export type { MediaFile, MediaFileValidationError } from './fileValidation';
export { UploadCancelledError } from './fileValidation';
