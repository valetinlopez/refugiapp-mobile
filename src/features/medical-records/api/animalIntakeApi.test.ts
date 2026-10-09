import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { animalIntakeApi } from './animalIntakeApi';

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

describe('animalIntakeApi', () => {
  it('normalizes the serialized ISO datetime intake date to YYYY-MM-DD', async () => {
    const client = createClient({
      [`GET /api/v1/animals/${ANIMAL_ID}`]: () => ({
        body: {
          id: ANIMAL_ID,
          name: 'Luna',
          species: 'dog',
          sex: 'female',
          status: 'admitted',
          intakeDate: '2026-01-10T03:00:00.000Z',
        },
      }),
    });

    await expect(animalIntakeApi.getIntakeDate(ANIMAL_ID, client)).resolves.toBe('2026-01-10');
  });

  it('returns null when the backend intake date is not a calendar date', async () => {
    const client = createClient({
      [`GET /api/v1/animals/${ANIMAL_ID}`]: () => ({
        body: { id: ANIMAL_ID, name: 'Luna', intakeDate: 'not-a-date' },
      }),
    });

    await expect(animalIntakeApi.getIntakeDate(ANIMAL_ID, client)).resolves.toBeNull();
  });
});
