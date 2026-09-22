import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { careTasksApi } from './careTasksApi';

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
const TASK_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';

function response(status: 'pending' | 'completed' | 'cancelled' = 'pending') {
  return {
    id: TASK_ID,
    animalId: ANIMAL_ID,
    title: 'Dar medicación',
    description: null,
    status,
    dueAt: null,
    completedAt: status === 'completed' ? '2026-09-22T18:00:00.000Z' : null,
    createdByUserId: '9fa85f64-5717-4562-b3fc-2c963f66afa6',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  };
}

describe('careTasksApi', () => {
  it('lists globally and by animal using query params', async () => {
    const client = createClient({
      'GET /api/v1/care-tasks': (request) => {
        expect(request.url.searchParams.get('page')).toBe('1');
        expect(request.url.searchParams.get('limit')).toBe('20');
        expect(request.url.searchParams.get('animalId')).toBe(ANIMAL_ID);
        expect(request.url.searchParams.get('status')).toBe('pending');
        return { body: { items: [response()], page: 1, limit: 20, total: 1 } };
      },
    });

    const result = await careTasksApi.list(
      { animalId: ANIMAL_ID, status: 'pending' },
      1,
      20,
      client
    );
    expect(result.items[0]?.animalId).toBe(ANIMAL_ID);
  });

  it('creates without sending actor information', async () => {
    let body: unknown;
    const client = createClient({
      'POST /api/v1/care-tasks': (request) => {
        body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
        return { status: 201, body: response() };
      },
    });

    await careTasksApi.create({ animalId: ANIMAL_ID, title: 'Dar medicación' }, client);
    expect(body).toEqual({ animalId: ANIMAL_ID, title: 'Dar medicación' });
  });

  it.each([
    ['complete', 'completed'],
    ['cancel', 'cancelled'],
  ] as const)('posts the %s transition', async (action, status) => {
    const client = createClient({
      [`POST /api/v1/care-tasks/${TASK_ID}/${action}`]: () => ({ body: response(status) }),
    });

    const result = await careTasksApi[action](TASK_ID, client);
    expect(result.status).toBe(status);
  });
});
