import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { medicalRecordsApi } from './medicalRecordsApi';

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

describe('medicalRecordsApi.list', () => {
  it('pages the global endpoint with only the documented filters', async () => {
    const client = createClient({
      'GET /api/v1/medical-records': (request) => {
        expect(request.url.searchParams.get('page')).toBe('2');
        expect(request.url.searchParams.get('limit')).toBe('20');
        expect(request.url.searchParams.get('recordType')).toBe('vaccination');
        expect(request.url.searchParams.get('from')).toBe('2026-09-01T00:00:00.000Z');
        expect(request.url.searchParams.get('to')).toBe('2026-09-30T23:59:59.999Z');
        expect(request.url.searchParams.has('animalId')).toBe(false);
        expect(request.url.searchParams.has('veterinarianId')).toBe(false);
        expect(request.url.searchParams.has('sortBy')).toBe(false);
        return {
          body: {
            items: [
              {
                id: 'record-1',
                animalId: ANIMAL_ID,
                veterinarianId: null,
                recordType: 'vaccination',
                title: 'Refuerzo anual',
                diagnosis: null,
                treatment: 'Dosis completa',
                notes: null,
                occurredAt: '2026-09-22T10:30:00.000Z',
                createdAt: '2026-09-22T10:30:00.000Z',
                updatedAt: '2026-09-22T10:30:00.000Z',
              },
            ],
            page: 2,
            limit: 20,
            total: 21,
          },
        };
      },
    });

    const result = await medicalRecordsApi.list(
      {
        recordType: 'vaccination',
        from: '2026-09-01T00:00:00.000Z',
        to: '2026-09-30T23:59:59.999Z',
      },
      2,
      20,
      client
    );

    expect(result.page).toBe(2);
    expect(result.total).toBe(21);
    expect(result.items[0]).toMatchObject({ id: 'record-1', veterinarianId: null });
  });
});

describe('medicalRecordsApi.remove', () => {
  it('soft-deletes one record through the documented endpoint', async () => {
    const recordId = '0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14';
    const client = createClient({
      [`DELETE /api/v1/medical-records/${recordId}`]: () => ({ status: 204 }),
    });

    await expect(medicalRecordsApi.remove(recordId, client)).resolves.toBeUndefined();
  });
});
