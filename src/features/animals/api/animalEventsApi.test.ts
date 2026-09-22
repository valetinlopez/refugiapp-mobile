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
