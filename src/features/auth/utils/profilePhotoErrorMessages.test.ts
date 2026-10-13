import { ApiError } from '@/core/api';
import { UploadCancelledError } from '@/core/media';

import { ProfilePhotoError, toProfilePhotoErrorMessage } from './profilePhotoErrorMessages';

describe('toProfilePhotoErrorMessage', () => {
  it('translates picker validation failures without internals', () => {
    expect(toProfilePhotoErrorMessage(new Error('Invalid profile photo: invalid_type'))).toBe(
      'El archivo elegido no es una imagen JPEG, PNG o WebP válida.'
    );
    expect(toProfilePhotoErrorMessage(new Error('Invalid profile photo: file_too_large'))).toBe(
      'La foto supera los 10 MB. Elegí una imagen más liviana.'
    );
  });

  it('unwraps the mutation phase and maps backend codes', () => {
    expect(
      toProfilePhotoErrorMessage(
        new ProfilePhotoError(
          'update',
          new ApiError({
            code: 'MEDIA_ALREADY_OWNED',
            message: 'owned',
            requestId: 'req-1',
            status: 409,
          })
        )
      )
    ).toBe('Esa imagen ya está vinculada a otro registro. Elegí otra foto.');
    expect(
      toProfilePhotoErrorMessage(
        new ApiError({
          code: 'INCOMPATIBLE_OWNER_TYPE',
          message: 'x',
          requestId: 'req-2',
          status: 409,
        })
      )
    ).toBe('Esa imagen no es válida como foto de perfil. Subí una nueva.');
    expect(
      toProfilePhotoErrorMessage(new ProfilePhotoError('photo', new UploadCancelledError()))
    ).toBe('Subida cancelada.');
  });

  it('maps transport failures without leaking payloads', () => {
    const network = new ApiError({
      code: 'NETWORK_ERROR',
      message: 'fail',
      requestId: 'req-3',
      status: 0,
    });
    const message = toProfilePhotoErrorMessage(network);
    expect(message).toBe('Sin conexión. Revisá tu red e intentá de nuevo.');
    expect(message).not.toContain('fail');
  });
});
