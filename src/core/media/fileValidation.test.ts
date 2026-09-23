import {
  DOCUMENT_MEDIA_TYPES,
  IMAGE_MEDIA_TYPES,
  MAX_MEDIA_FILE_BYTES,
  validateMediaFile,
  type MediaFile,
} from './fileValidation';

const BASE_FILE: MediaFile = {
  uri: 'file:///document.pdf',
  name: 'document.pdf',
  mimeType: 'application/pdf',
  size: 1024,
};

describe('validateMediaFile', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])(
    'accepts backend-supported clinical type %s',
    (mimeType) => {
      expect(validateMediaFile({ ...BASE_FILE, mimeType }, DOCUMENT_MEDIA_TYPES)).toBeNull();
    }
  );

  it('rejects a PDF when only profile images are allowed', () => {
    expect(validateMediaFile(BASE_FILE, IMAGE_MEDIA_TYPES)).toBe('invalid_type');
  });

  it('rejects a file larger than the backend limit', () => {
    expect(
      validateMediaFile({ ...BASE_FILE, size: MAX_MEDIA_FILE_BYTES + 1 }, DOCUMENT_MEDIA_TYPES)
    ).toBe('file_too_large');
  });

  it('accepts a file exactly at the backend limit', () => {
    expect(
      validateMediaFile({ ...BASE_FILE, size: MAX_MEDIA_FILE_BYTES }, DOCUMENT_MEDIA_TYPES)
    ).toBeNull();
  });

  it('can require size metadata before upload', () => {
    expect(
      validateMediaFile(
        {
          uri: BASE_FILE.uri,
          name: BASE_FILE.name,
          mimeType: BASE_FILE.mimeType,
        },
        DOCUMENT_MEDIA_TYPES,
        { requireSize: true }
      )
    ).toBe('missing_size');
  });
});
