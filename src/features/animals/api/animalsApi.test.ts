import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { animalsApi } from './animalsApi';

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

describe('animalsApi.create', () => {
  it('sends the DTO as JSON and maps the response to the view model', async () => {
    let capturedBody: unknown;
    const client = createClient({
      'POST /api/v1/animals': ({ body }) => {
        capturedBody = typeof body === 'string' ? (JSON.parse(body) as unknown) : body;
        return {
          status: 201,
          body: {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            name: 'Luna',
            species: 'dog',
            breed: 'mixed',
            sex: 'female',
            status: 'admitted',
            intakeDate: '2026-01-10',
            birthDate: '2025-06-01',
            profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
          },
        };
      },
    });

    const animal = await animalsApi.create(
      {
        name: 'Luna',
        species: 'dog',
        breed: 'mixed',
        sex: 'female',
        status: 'admitted',
        intakeDate: '2026-01-10',
        birthDate: '2025-06-01',
        profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      client
    );

    expect(capturedBody).toEqual({
      name: 'Luna',
      species: 'dog',
      breed: 'mixed',
      sex: 'female',
      status: 'admitted',
      intakeDate: '2026-01-10',
      birthDate: '2025-06-01',
      profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
    });
    expect(animal).toEqual({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'Luna',
      species: 'dog',
      breed: 'mixed',
      sex: 'female',
      status: 'admitted',
      intakeDate: '2026-01-10',
      birthDate: '2025-06-01',
      profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
    });
  });

  it('propagates backend errors without masking them', async () => {
    const client = createClient({
      'POST /api/v1/animals': () => ({
        status: 422,
        body: { code: 'VALIDATION_ERROR' },
      }),
    });

    await expect(
      animalsApi.create({ name: 'Luna', species: 'dog', intakeDate: '2026-01-10' }, client)
    ).rejects.toMatchObject({ status: 422 });
  });
});

describe('animalsApi.getAll', () => {
  it('sends pagination and filters and maps items to the view model', async () => {
    let capturedQuery: Record<string, string> | undefined;
    const client = createClient({
      'GET /api/v1/animals': ({ url }) => {
        capturedQuery = Object.fromEntries(url.searchParams.entries());
        return {
          body: {
            items: [
              {
                id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                name: 'Luna',
                species: 'dog',
                breed: null,
                sex: 'female',
                status: 'admitted',
                intakeDate: '2026-01-10',
                profilePhotoMediaId: null,
              },
            ],
            page: 1,
            limit: 20,
            total: 1,
          },
        };
      },
    });

    const result = await animalsApi.getAll(
      { status: 'admitted', sex: 'female', name: 'luna' },
      1,
      20,
      client
    );

    expect(capturedQuery).toEqual({
      page: '1',
      limit: '20',
      status: 'admitted',
      sex: 'female',
      name: 'luna',
    });
    expect(result.total).toBe(1);
    expect(result.items[0]?.name).toBe('Luna');
  });

  it('propagates a 401 without masking it', async () => {
    const client = createClient({
      'GET /api/v1/animals': () => ({
        status: 401,
        body: { code: 'UNAUTHORIZED' },
      }),
    });

    await expect(animalsApi.getAll({}, 1, 20, client)).rejects.toMatchObject({ status: 401 });
  });
});

describe('animalsApi.getById', () => {
  it('fetches the detail and maps it to the view model', async () => {
    const client = createClient({
      'GET /api/v1/animals/3fa85f64-5717-4562-b3fc-2c963f66afa6': () => ({
        body: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          name: 'Luna',
          species: 'dog',
          breed: null,
          sex: 'female',
          status: 'admitted',
          intakeDate: '2026-01-10',
          profilePhotoMediaId: null,
        },
      }),
    });

    const animal = await animalsApi.getById('3fa85f64-5717-4562-b3fc-2c963f66afa6', client);

    expect(animal.name).toBe('Luna');
    expect(animal.breed).toBeNull();
  });

  it('propagates a 404 when the animal does not exist', async () => {
    const client = createClient({
      'GET /api/v1/animals/3fa85f64-5717-4562-b3fc-2c963f66afa6': () => ({
        status: 404,
        body: { code: 'ANIMAL_NOT_FOUND' },
      }),
    });

    await expect(
      animalsApi.getById('3fa85f64-5717-4562-b3fc-2c963f66afa6', client)
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe('animalsApi.update', () => {
  it('PATCHes the update DTO without status and maps the response', async () => {
    let capturedBody: unknown;
    const client = createClient({
      'PATCH /api/v1/animals/3fa85f64-5717-4562-b3fc-2c963f66afa6': ({ body }) => {
        capturedBody = typeof body === 'string' ? (JSON.parse(body) as unknown) : body;
        return {
          body: {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            name: 'Luna',
            species: 'dog',
            breed: 'mixed',
            sex: 'female',
            status: 'admitted',
            intakeDate: '2026-01-10',
            profilePhotoMediaId: null,
          },
        };
      },
    });

    const animal = await animalsApi.update(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      { name: 'Luna', species: 'dog', sex: 'female', intakeDate: '2026-01-10' },
      client
    );

    expect(capturedBody).toEqual({
      name: 'Luna',
      species: 'dog',
      sex: 'female',
      intakeDate: '2026-01-10',
    });
    expect(animal.status).toBe('admitted');
  });

  it('propagates a 403 without masking it', async () => {
    const client = createClient({
      'PATCH /api/v1/animals/3fa85f64-5717-4562-b3fc-2c963f66afa6': () => ({
        status: 403,
        body: { code: 'FORBIDDEN' },
      }),
    });

    await expect(
      animalsApi.update('3fa85f64-5717-4562-b3fc-2c963f66afa6', { name: 'Luna' }, client)
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe('animalsApi.changeStatus', () => {
  it('PATCHes the status endpoint and maps the updated animal', async () => {
    let capturedBody: unknown;
    const client = createClient({
      'PATCH /api/v1/animals/3fa85f64-5717-4562-b3fc-2c963f66afa6/status': ({ body }) => {
        capturedBody = typeof body === 'string' ? (JSON.parse(body) as unknown) : body;
        return {
          body: {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            name: 'Luna',
            species: 'dog',
            sex: 'female',
            status: 'available_for_adoption',
            intakeDate: '2026-01-10',
            profilePhotoMediaId: null,
          },
        };
      },
    });

    const animal = await animalsApi.changeStatus(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      { status: 'available_for_adoption' },
      client
    );

    expect(capturedBody).toEqual({ status: 'available_for_adoption' });
    expect(animal.status).toBe('available_for_adoption');
  });

  it('propagates a 409 for invalid transitions', async () => {
    const client = createClient({
      'PATCH /api/v1/animals/3fa85f64-5717-4562-b3fc-2c963f66afa6/status': () => ({
        status: 409,
        body: { code: 'INVALID_STATUS_TRANSITION' },
      }),
    });

    await expect(
      animalsApi.changeStatus('3fa85f64-5717-4562-b3fc-2c963f66afa6', { status: 'adopted' }, client)
    ).rejects.toMatchObject({ status: 409 });
  });
});
