import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { profileApi } from './profileApi';

const USER_ID = '52f45f39-c7b5-4a1a-aa37-ed0fdf203c91';
const MEDIA_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';

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

describe('profileApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uploads the avatar as orphan multipart without forcing JSON content type', async () => {
    let capturedBody: unknown;
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const client = createClient({
      'POST /api/v1/media/upload': ({ body }) => {
        capturedBody = body;
        return {
          status: 201,
          body: {
            id: MEDIA_ID,
            resourceType: 'image',
            publicId: 'refugiapp/avatars',
            secureUrl: 'https://cloudinary.test/avatar.jpg',
          },
        };
      },
    });

    const asset = await profileApi.uploadOrphanAvatar(
      { mimeType: 'image/jpeg', name: 'avatar.jpg', uri: 'file:///avatar.jpg' },
      client
    );

    expect(asset.id).toBe(MEDIA_ID);
    expect(capturedBody).toBeInstanceOf(FormData);
    expect(appendSpy).toHaveBeenCalledWith(
      'file',
      expect.objectContaining({ name: 'avatar.jpg', type: 'image/jpeg', uri: 'file:///avatar.jpg' })
    );
  });

  it('rejects non-image files before any network call', async () => {
    const client = createClient({
      'POST /api/v1/media/upload': () => ({ body: {} }),
    });

    await expect(
      profileApi.uploadOrphanAvatar(
        { mimeType: 'application/pdf', name: 'doc.pdf', uri: 'file:///doc.pdf' },
        client
      )
    ).rejects.toThrow('Invalid profile photo: invalid_type');
  });

  it('patches the user with the linked media id and clears it with null', async () => {
    let capturedBody: unknown;
    const client = createClient({
      [`PATCH /api/v1/users/${USER_ID}`]: ({ body }) => {
        const parsed = JSON.parse(body as string) as { profilePhotoMediaId: string | null };
        capturedBody = parsed;
        return {
          body: {
            email: 'andres@refugiapp.org',
            firstName: 'Andrés',
            id: USER_ID,
            isActive: true,
            lastName: 'Borrego',
            profilePhotoMediaId: parsed.profilePhotoMediaId,
            roles: ['shelter_manager'],
            createdAt: '2026-09-07T15:00:00.000Z',
            updatedAt: '2026-09-07T15:00:00.000Z',
          },
        };
      },
    });

    const linked = await profileApi.updatePhoto(USER_ID, MEDIA_ID, client);
    expect(linked.profilePhotoMediaId).toBe(MEDIA_ID);
    expect(capturedBody).toEqual({ profilePhotoMediaId: MEDIA_ID });

    const cleared = await profileApi.updatePhoto(USER_ID, null, client);
    expect(cleared.profilePhotoMediaId).toBeNull();
    expect(capturedBody).toEqual({ profilePhotoMediaId: null });
  });

  it('fetches the avatar asset by id', async () => {
    const client = createClient({
      [`GET /api/v1/media/${MEDIA_ID}`]: () => ({
        body: { id: MEDIA_ID, secureUrl: 'https://cloudinary.test/avatar.jpg' },
      }),
    });

    const asset = await profileApi.getAvatarAsset(MEDIA_ID, client);
    expect(asset.secureUrl).toBe('https://cloudinary.test/avatar.jpg');
  });
});
