import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { animalFilesApi, buildAnimalFileFormData } from './animalFilesApi';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

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

describe('buildAnimalFileFormData', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('appends the file and links it to the animal owner', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');

    buildAnimalFileFormData(
      { uri: 'file:///estudio.pdf', name: 'estudio.pdf', mimeType: 'application/pdf' },
      ANIMAL_ID
    );

    expect(appendSpy).toHaveBeenCalledWith(
      'file',
      expect.objectContaining({ uri: 'file:///estudio.pdf', name: 'estudio.pdf' })
    );
    expect(appendSpy).toHaveBeenCalledWith('ownerType', 'animal');
    expect(appendSpy).toHaveBeenCalledWith('ownerId', ANIMAL_ID);
  });
});

describe('animalFilesApi.listByAnimal', () => {
  it('lists the media owned by the animal preserving pagination', async () => {
    let capturedUrl: URL | undefined;
    const client = createClient({
      'GET /api/v1/media': ({ url }) => {
        capturedUrl = url;
        return {
          body: {
            items: [
              {
                id: 'file-1',
                resourceType: 'image',
                publicId: 'refugiapp/animals/luna',
                secureUrl: 'https://res.cloudinary.com/demo/image/upload/luna.jpg',
              },
            ],
            page: 1,
            limit: 20,
            total: 1,
          },
        };
      },
    });

    const page = await animalFilesApi.listByAnimal(ANIMAL_ID, 1, 20, client);

    expect(capturedUrl?.searchParams.get('ownerType')).toBe('animal');
    expect(capturedUrl?.searchParams.get('ownerId')).toBe(ANIMAL_ID);
    expect(capturedUrl?.searchParams.get('page')).toBe('1');
    expect(page.items[0]?.isImage).toBe(true);
  });
});

describe('animalFilesApi.uploadToAnimal', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uploads as multipart without forcing a JSON content type', async () => {
    let capturedHeaders: Record<string, string> = {};
    const client = createClient({
      'POST /api/v1/media/upload': ({ headers }) => {
        capturedHeaders = headers;
        return {
          status: 201,
          body: {
            id: 'file-1',
            resourceType: 'raw',
            publicId: 'refugiapp/animals/estudio.pdf',
            secureUrl: 'https://res.cloudinary.com/demo/raw/upload/estudio.pdf',
          },
        };
      },
    });

    const asset = await animalFilesApi.uploadToAnimal(
      ANIMAL_ID,
      { uri: 'file:///estudio.pdf', name: 'estudio.pdf', mimeType: 'application/pdf' },
      client
    );

    expect(asset.id).toBe('file-1');
    expect(capturedHeaders['Content-Type']).toBeUndefined();
  });

  it('rejects an unsupported file before hitting the network', async () => {
    const client = createClient({});

    await expect(
      animalFilesApi.uploadToAnimal(
        ANIMAL_ID,
        { uri: 'file:///notes.txt', name: 'notes.txt', mimeType: 'text/plain' },
        client
      )
    ).rejects.toThrow('Invalid animal file');
  });

  it('propagates upload failures without inventing an asset', async () => {
    const client = createClient({
      'POST /api/v1/media/upload': () => ({ status: 403, body: { code: 'FORBIDDEN' } }),
    });

    await expect(
      animalFilesApi.uploadToAnimal(
        ANIMAL_ID,
        { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg' },
        client
      )
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe('animalFilesApi.deleteAsset', () => {
  it('deletes the media asset', async () => {
    const client = createClient({
      'DELETE /api/v1/media/file-1': () => ({ status: 204 }),
    });

    await expect(animalFilesApi.deleteAsset('file-1', client)).resolves.toBeUndefined();
  });

  it('propagates a 403 when the role cannot delete the asset', async () => {
    const client = createClient({
      'DELETE /api/v1/media/file-1': () => ({ status: 403, body: { code: 'FORBIDDEN' } }),
    });

    await expect(animalFilesApi.deleteAsset('file-1', client)).rejects.toMatchObject({
      status: 403,
    });
  });
});
