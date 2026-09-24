import {
  DOCUMENT_MEDIA_TYPES,
  IMAGE_MEDIA_TYPES,
  MAX_MEDIA_FILE_BYTES,
  validateMediaFile,
  inferMimeTypeFromName,
  normalizeMediaFileName,
  resolveMediaMimeType,
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

describe('inferMimeTypeFromName', () => {
  it('maps common image and document extensions', () => {
    expect(inferMimeTypeFromName('photo.jpg')).toBe('image/jpeg');
    expect(inferMimeTypeFromName('photo.JPEG')).toBe('image/jpeg');
    expect(inferMimeTypeFromName('photo.png')).toBe('image/png');
    expect(inferMimeTypeFromName('photo.webp')).toBe('image/webp');
    expect(inferMimeTypeFromName('document.pdf')).toBe('application/pdf');
  });

  it('returns null for unknown extensions and names without a path segment', () => {
    expect(inferMimeTypeFromName('image.heic')).toBeNull();
    expect(inferMimeTypeFromName('')).toBeNull();
  });
});

describe('resolveMediaMimeType', () => {
  it('prefers the picker mime type when present', () => {
    expect(resolveMediaMimeType('photo.jpg', 'Image/JPEG')).toBe('image/jpeg');
  });

  it('falls back to the extension when the picker omits mime type', () => {
    expect(resolveMediaMimeType('photo.png', null)).toBe('image/png');
  });

  it('falls back to the default mime when neither is available', () => {
    expect(resolveMediaMimeType('unknown.bin', null)).toBe('image/jpeg');
    expect(resolveMediaMimeType('unknown.bin', undefined, 'application/pdf')).toBe(
      'application/pdf'
    );
  });
});

describe('normalizeMediaFileName', () => {
  it('keeps a name already ending in the matching extension', () => {
    expect(normalizeMediaFileName('photo.jpg', 'image/jpeg')).toBe('photo.jpg');
  });

  it('replaces a mismatched extension to match the mime type', () => {
    expect(normalizeMediaFileName('photo.heic', 'image/jpeg')).toBe('photo.jpg');
  });

  it('appends the extension when the name has none', () => {
    expect(normalizeMediaFileName('photo', 'image/png')).toBe('photo.png');
  });

  it('ignores query strings and leaves unrelated mime types untouched', () => {
    expect(normalizeMediaFileName('photo.jpg?x=1', 'image/jpeg')).toBe('photo.jpg');
    expect(normalizeMediaFileName('scan', 'application/pdf')).toBe('scan.pdf');
  });
});
