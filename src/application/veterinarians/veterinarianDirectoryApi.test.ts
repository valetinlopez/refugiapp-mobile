import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { veterinarianDirectoryApi } from './veterinarianDirectoryApi';
import { resolveVeterinarianLabel } from './useVeterinarianDirectory';

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

const VET_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const OTHER_VET_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('veterinarianDirectoryApi', () => {
  it('lists the first 100 active veterinarians sorted by name', async () => {
    const client = createClient({
      'GET /api/v1/veterinarians': (request) => {
        expect(request.url.searchParams.get('page')).toBe('1');
        expect(request.url.searchParams.get('limit')).toBe('100');
        expect(request.url.searchParams.get('isActive')).toBe('true');
        return {
          body: {
            items: [
              { id: VET_ID, firstName: 'Sofía', lastName: 'Gómez', licenseNumber: 'MP 100' },
              { id: OTHER_VET_ID, firstName: 'Ana', lastName: 'Díaz', licenseNumber: 'MP 200' },
            ],
            page: 1,
            limit: 100,
            total: 2,
          },
        };
      },
    });

    const directory = await veterinarianDirectoryApi.listActive(client);

    expect(directory).toEqual([
      { id: OTHER_VET_ID, name: 'Ana Díaz', licenseNumber: 'MP 200' },
      { id: VET_ID, name: 'Sofía Gómez', licenseNumber: 'MP 100' },
    ]);
  });

  it('resolves one veterinarian without reading the whole directory', async () => {
    const client = createClient({
      [`GET /api/v1/veterinarians/${VET_ID}`]: () => ({
        body: {
          id: VET_ID,
          firstName: 'Sofía',
          lastName: 'Gómez',
          licenseNumber: 'MP 100',
        },
      }),
    });

    await expect(veterinarianDirectoryApi.getById(VET_ID, client)).resolves.toEqual({
      id: VET_ID,
      name: 'Sofía Gómez',
      licenseNumber: 'MP 100',
    });
  });
});

describe('resolveVeterinarianLabel', () => {
  const namesById = new Map([[VET_ID, 'Sofía Gómez']]);

  it('falls back explicitly for an unassigned veterinarian', () => {
    expect(resolveVeterinarianLabel(namesById, null)).toBe('Sin veterinario asignado');
  });

  it('resolves a name present in the directory', () => {
    expect(resolveVeterinarianLabel(namesById, VET_ID)).toBe('Sofía Gómez');
  });

  it('degrades to an explicit fallback for an inactive or out-of-page id', () => {
    expect(resolveVeterinarianLabel(namesById, OTHER_VET_ID)).toBe('Veterinario no disponible');
  });
});
