import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import type { UserResponse } from '../types';
import { usersApi } from './usersApi';

const USER_ID = '11111111-1111-4111-8111-111111111111';

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

function user(isActive = true): UserResponse {
  return {
    id: USER_ID,
    email: 'admin@refugiapp.local',
    firstName: 'Ana',
    lastName: 'Perez',
    roles: ['admin'],
    isActive,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  };
}

describe('usersApi', () => {
  it('sends pagination when listing users', async () => {
    let capturedQuery: Record<string, string> | undefined;
    const client = createClient({
      'GET /api/v1/users': ({ url }) => {
        capturedQuery = Object.fromEntries(url.searchParams.entries());
        return { body: { items: [user()], page: 2, limit: 20, total: 21 } };
      },
    });

    const result = await usersApi.list(2, 20, client);

    expect(capturedQuery).toEqual({ page: '2', limit: '20' });
    expect(result.items).toHaveLength(1);
  });

  it('sends the normalized create-user DTO without retaining the password', async () => {
    let capturedBody: unknown;
    const client = createClient({
      'POST /api/v1/users': ({ body }) => {
        capturedBody = typeof body === 'string' ? (JSON.parse(body) as unknown) : body;
        return { status: 201, body: user() };
      },
    });
    const input: Parameters<typeof usersApi.create>[0] = {
      email: 'admin@refugiapp.local',
      firstName: 'Ana',
      lastName: 'Perez',
      password: 'secure-pass-123',
      roles: ['admin'],
    };

    const result = await usersApi.create(input, client);

    expect(capturedBody).toEqual(input);
    expect(result).not.toHaveProperty('password');
  });

  it('uses the activation and deactivation endpoints', async () => {
    const calls: string[] = [];
    const client = createClient({
      [`POST /api/v1/users/${USER_ID}/activate`]: ({ url }) => {
        calls.push(url.pathname);
        return { body: user(true) };
      },
      [`POST /api/v1/users/${USER_ID}/deactivate`]: ({ url }) => {
        calls.push(url.pathname);
        return { status: 204 };
      },
    });

    await usersApi.activate(USER_ID, client);
    await usersApi.deactivate(USER_ID, client);

    expect(calls).toEqual([
      `/api/v1/users/${USER_ID}/activate`,
      `/api/v1/users/${USER_ID}/deactivate`,
    ]);
  });
});
