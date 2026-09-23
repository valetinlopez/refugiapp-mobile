import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { mediaApi } from './mediaApi';

function createClient(routes: FakeHttpRoutes): HttpClient {
  return createHttpClient({
    baseUrl: 'https://api.test/api/v1',
    timeoutMs: 1000,
    tokenStore: {
      clearTokens: async () => undefined,
      getTokens: async () => null,
      setTokens: async () => undefined,
    },
    transport: createFakeHttpTransport(routes),
  });
}

describe('mediaApi.uploadOrphanPhoto', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uploads the photo as multipart without forcing a JSON content type', async () => {
    let capturedBody: unknown;
    let capturedHeaders: Record<string, string> = {};
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const client = createClient({
      'POST /api/v1/media/upload': ({ body, headers }) => {
        capturedBody = body;
        capturedHeaders = headers;
        return {
          status: 201,
          body: {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            resourceType: 'image',
            publicId: 'refugiapp/profile-photo',
            secureUrl: 'https://cloudinary.test/profile-photo.jpg',
          },
        };
      },
    });

    const asset = await mediaApi.uploadOrphanPhoto(
      { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg' },
      client
    );

    expect(asset.id).toBe('3fa85f64-5717-4562-b3fc-2c963f66afa6');
    expect(capturedBody).toBeInstanceOf(FormData);
    expect(appendSpy).toHaveBeenCalledWith(
      'file',
      expect.objectContaining({
        uri: 'file:///photo.jpg',
        name: 'photo.jpg',
        type: 'image/jpeg',
      })
    );
    expect(capturedHeaders['Content-Type']).toBeUndefined();
  });

  it('appends the browser File instead of the native URI descriptor on web', async () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const browserFile = new Blob(['photo'], { type: 'image/jpeg' });
    const client = createClient({
      'POST /api/v1/media/upload': () => ({
        status: 201,
        body: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          resourceType: 'image',
          publicId: 'refugiapp/profile-photo',
          secureUrl: 'https://cloudinary.test/profile-photo.jpg',
        },
      }),
    });

    await mediaApi.uploadOrphanPhoto(
      {
        uri: 'blob:https://app.test/photo',
        name: 'photo.jpg',
        mimeType: 'image/jpeg',
        file: browserFile,
      },
      client
    );

    expect(appendSpy).toHaveBeenCalledWith('file', browserFile);
  });

  it('propagates upload failures without inventing an asset', async () => {
    const client = createClient({
      'POST /api/v1/media/upload': () => ({
        status: 400,
        body: { code: 'FILE_REQUIRED' },
      }),
    });

    await expect(
      mediaApi.uploadOrphanPhoto(
        { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg' },
        client
      )
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('mediaApi.getById', () => {
  it('fetches the media asset metadata', async () => {
    const client = createClient({
      'GET /api/v1/media/7fa85f64-5717-4562-b3fc-2c963f66afa6': () => ({
        body: {
          id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
          resourceType: 'image',
          publicId: 'refugiapp/profile-photo',
          secureUrl: 'https://cloudinary.test/profile-photo.jpg',
        },
      }),
    });

    const asset = await mediaApi.getById('7fa85f64-5717-4562-b3fc-2c963f66afa6', client);

    expect(asset.secureUrl).toBe('https://cloudinary.test/profile-photo.jpg');
  });

  it('propagates a 404 when the asset is missing', async () => {
    const client = createClient({
      'GET /api/v1/media/7fa85f64-5717-4562-b3fc-2c963f66afa6': () => ({
        status: 404,
        body: { code: 'MEDIA_NOT_FOUND' },
      }),
    });

    await expect(
      mediaApi.getById('7fa85f64-5717-4562-b3fc-2c963f66afa6', client)
    ).rejects.toMatchObject({
      status: 404,
    });
  });
});
