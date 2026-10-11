import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { homeApi } from './homeApi';

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

function taskResponse(overrides: Record<string, unknown> = {}) {
  return {
    id: TASK_ID,
    animalId: ANIMAL_ID,
    title: 'Control veterinario',
    description: null,
    status: 'pending',
    dueAt: '2026-10-10T11:00:00.000Z',
    completedAt: null,
    createdByUserId: null,
    createdAt: '2026-10-09T10:00:00.000Z',
    updatedAt: '2026-10-09T10:00:00.000Z',
    ...overrides,
  };
}

describe('homeApi (D36 / RFG-169)', () => {
  it('reads the exact pending count with a limit=1 request', async () => {
    const client = createClient({
      'GET /api/v1/care-tasks': (request) => {
        expect(request.url.searchParams.get('page')).toBe('1');
        expect(request.url.searchParams.get('limit')).toBe('1');
        expect(request.url.searchParams.get('status')).toBe('pending');
        return { body: { items: [taskResponse()], page: 1, limit: 1, total: 6 } };
      },
    });

    await expect(homeApi.getPendingCareTaskCount(client)).resolves.toBe(6);
  });

  it('maps the pending page to minimal priority tasks without leaking extra fields', async () => {
    const client = createClient({
      'GET /api/v1/care-tasks': (request) => {
        expect(request.url.searchParams.get('limit')).toBe('10');
        expect(request.url.searchParams.get('status')).toBe('pending');
        return {
          body: {
            items: [taskResponse(), taskResponse({ id: 'other', dueAt: null })],
            page: 1,
            limit: 10,
            total: 6,
          },
        };
      },
    });

    await expect(homeApi.listPendingCareTasks(client)).resolves.toEqual([
      {
        animalId: ANIMAL_ID,
        dueAt: '2026-10-10T11:00:00.000Z',
        id: TASK_ID,
        title: 'Control veterinario',
      },
      { animalId: ANIMAL_ID, dueAt: null, id: 'other', title: 'Control veterinario' },
    ]);
  });

  it('reads the expense record count with a limit=1 request', async () => {
    const client = createClient({
      'GET /api/v1/expenses': (request) => {
        expect(request.url.searchParams.get('page')).toBe('1');
        expect(request.url.searchParams.get('limit')).toBe('1');
        return { body: { items: [], page: 1, limit: 1, total: 12 } };
      },
    });

    await expect(homeApi.getExpenseCount(client)).resolves.toBe(12);
  });

  it('normalizes an unexpected total to zero instead of rendering NaN', async () => {
    const client = createClient({
      'GET /api/v1/care-tasks': () => ({
        body: { items: [], page: 1, limit: 1, total: -3 },
      }),
    });

    await expect(homeApi.getPendingCareTaskCount(client)).resolves.toBe(0);
  });
});
