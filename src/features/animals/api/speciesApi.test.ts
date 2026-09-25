import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { speciesApi } from './speciesApi';

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

describe('speciesApi.getSpecies', () => {
  it('fetches the species catalog and maps items to the view model', async () => {
    let capturedUrl: URL | undefined;
    const client = createClient({
      'GET /api/v1/species': ({ url }) => {
        capturedUrl = url;
        return {
          body: {
            items: [
              { id: 'species-dog', slug: 'dog', labelEs: 'Perro' },
              { id: 'species-other', slug: 'other', labelEs: 'Otro' },
            ],
          },
        };
      },
    });

    const species = await speciesApi.getSpecies(client);

    expect(capturedUrl?.pathname).toBe('/api/v1/species');
    expect(species).toEqual([
      { id: 'species-dog', slug: 'dog', labelEs: 'Perro' },
      { id: 'species-other', slug: 'other', labelEs: 'Otro' },
    ]);
  });

  it('propagates a 401 without masking it', async () => {
    const client = createClient({
      'GET /api/v1/species': () => ({ status: 401, body: { code: 'UNAUTHORIZED' } }),
    });

    await expect(speciesApi.getSpecies(client)).rejects.toMatchObject({ status: 401 });
  });
});

describe('speciesApi.getBreeds', () => {
  it('fetches the breeds for a species id and maps them', async () => {
    let capturedUrl: URL | undefined;
    const client = createClient({
      'GET /api/v1/species/species-dog/breeds': ({ url }) => {
        capturedUrl = url;
        return {
          body: {
            items: [
              { id: 'breed-1', speciesId: 'species-dog', slug: 'mestizo', labelEs: 'Mestizo' },
            ],
          },
        };
      },
    });

    const breeds = await speciesApi.getBreeds('species-dog', client);

    expect(capturedUrl?.pathname).toBe('/api/v1/species/species-dog/breeds');
    expect(breeds).toEqual([
      { id: 'breed-1', speciesId: 'species-dog', slug: 'mestizo', labelEs: 'Mestizo' },
    ]);
  });

  it('propagates a 404 when the species does not exist', async () => {
    const client = createClient({
      'GET /api/v1/species/missing/breeds': () => ({
        status: 404,
        body: { code: 'RESOURCE_NOT_FOUND' },
      }),
    });

    await expect(speciesApi.getBreeds('missing', client)).rejects.toMatchObject({ status: 404 });
  });
});
