import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { animalEventsApi } from './animalEventsApi';

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

describe('animalEventsApi.create', () => {
  it('posts the event without sending actor information', async () => {
    let capturedBody: unknown;
    const client = createClient({
      [`POST /api/v1/animals/${ANIMAL_ID}/events`]: ({ body }) => {
        capturedBody = typeof body === 'string' ? (JSON.parse(body) as unknown) : body;
        return {
          status: 201,
          body: {
            id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
            animalId: ANIMAL_ID,
            eventType: 'behavior_note',
            description: 'Se adaptó correctamente.',
            occurredAt: '2026-09-21T14:30:00.000Z',
            createdByUserId: '9fa85f64-5717-4562-b3fc-2c963f66afa6',
            metadata: {},
          },
        };
      },
    });

    const event = await animalEventsApi.create(
      ANIMAL_ID,
      {
        eventType: 'behavior_note',
        description: 'Se adaptó correctamente.',
      },
      client
    );

    expect(capturedBody).toEqual({
      eventType: 'behavior_note',
      description: 'Se adaptó correctamente.',
    });
    expect(event.createdByUserId).toBe('9fa85f64-5717-4562-b3fc-2c963f66afa6');
  });
});

describe('animalEventsApi.list', () => {
  it('lists the history events and maps them to the view model', async () => {
    let capturedQuery: Record<string, string> | undefined;
    const client = createClient({
      [`GET /api/v1/animals/${ANIMAL_ID}/events`]: ({ url }) => {
        capturedQuery = Object.fromEntries(url.searchParams.entries());
        return {
          body: {
            items: [
              {
                id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
                animalId: ANIMAL_ID,
                eventType: 'status_change',
                description: 'Pasó a disponible para adopción.',
                occurredAt: '2026-09-21T14:30:00.000Z',
                createdByUserId: null,
                metadata: {},
              },
            ],
            page: 1,
            limit: 20,
            total: 1,
          },
        };
      },
    });

    const result = await animalEventsApi.list(
      ANIMAL_ID,
      { eventType: 'status_change' },
      2,
      10,
      client
    );

    expect(capturedQuery).toEqual({ page: '2', limit: '10', eventType: 'status_change' });
    expect(result.total).toBe(1);
    expect(result.items[0]).toEqual({
      id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      animalId: ANIMAL_ID,
      eventType: 'status_change',
      description: 'Pasó a disponible para adopción.',
      occurredAt: '2026-09-21T14:30:00.000Z',
      createdByUserId: null,
    });
  });

  it('propagates a 403 without masking it', async () => {
    const client = createClient({
      [`GET /api/v1/animals/${ANIMAL_ID}/events`]: () => ({
        status: 403,
        body: { code: 'FORBIDDEN' },
      }),
    });

    await expect(animalEventsApi.list(ANIMAL_ID, {}, 1, 20, client)).rejects.toMatchObject({
      status: 403,
    });
  });
});
