import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { animalOptionsApi } from './animalOptionsApi';

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

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const OTHER_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';
const MEDIA_ID = '9fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('animalOptionsApi', () => {
  it('lists the first 100 animals without undocumented sort params and sorts by name', async () => {
    const client = createClient({
      'GET /api/v1/animals': (request) => {
        expect(request.url.searchParams.get('page')).toBe('1');
        expect(request.url.searchParams.get('limit')).toBe('100');
        expect(request.url.searchParams.has('sortBy')).toBe(false);
        expect(request.url.searchParams.has('sortOrder')).toBe(false);
        return {
          body: {
            items: [
              {
                id: ANIMAL_ID,
                name: 'Luna',
                species: 'dog',
                breed: 'Mestiza',
                profilePhotoMediaId: MEDIA_ID,
              },
              { id: OTHER_ID, name: 'Apolo', species: 'cat' },
            ],
            page: 1,
            limit: 100,
            total: 2,
          },
        };
      },
    });

    const options = await animalOptionsApi.list(client);

    expect(options).toEqual([
      {
        id: OTHER_ID,
        name: 'Apolo',
        species: 'cat',
        breed: null,
        profilePhotoMediaId: null,
      },
      {
        id: ANIMAL_ID,
        name: 'Luna',
        species: 'dog',
        breed: 'Mestiza',
        profilePhotoMediaId: MEDIA_ID,
      },
    ]);
  });

  it('maps a single animal detail to an option', async () => {
    const client = createClient({
      [`GET /api/v1/animals/${ANIMAL_ID}`]: () => ({
        body: {
          id: ANIMAL_ID,
          name: 'Luna',
          species: 'dog',
          profilePhotoMediaId: MEDIA_ID,
        },
      }),
    });

    const option = await animalOptionsApi.getById(ANIMAL_ID, client);

    expect(option).toEqual({
      id: ANIMAL_ID,
      name: 'Luna',
      species: 'dog',
      breed: null,
      profilePhotoMediaId: MEDIA_ID,
    });
  });

  it('resolves the optimized avatar source from the media contract', async () => {
    const client = createClient({
      [`GET /api/v1/media/${MEDIA_ID}`]: () => ({
        body: {
          id: MEDIA_ID,
          publicId: 'animals/luna',
          resourceType: 'image',
          secureUrl: 'https://res.cloudinary.com/demo/image/upload/luna.jpg',
        },
      }),
    });

    await expect(animalOptionsApi.getPhotoUrl(MEDIA_ID, client)).resolves.toBe(
      'https://res.cloudinary.com/demo/image/upload/luna.jpg'
    );
  });
});
