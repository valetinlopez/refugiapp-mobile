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
