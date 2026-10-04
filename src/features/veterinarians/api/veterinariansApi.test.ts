import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import type { CreateVeterinarianRequest, VeterinarianResponse } from '../types';
import { veterinariansApi } from './veterinariansApi';

const VET_ID = '11111111-1111-4111-8111-111111111111';
const USER_ID = '22222222-2222-4222-8222-222222222222';

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

function veterinarian(isActive = true): VeterinarianResponse {
  return {
    id: VET_ID,
    userId: USER_ID,
    firstName: 'Sofía',
    lastName: 'Romero',
    licenseNumber: 'VET-001',
    email: 'sofia@refugiapp.local',
    phone: '+54 11 5555 0101',
    notes: 'Especialista en felinos.',
    isActive,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  };
}

describe('veterinariansApi', () => {
  it('sends pagination and filters when listing veterinarians', async () => {
    let capturedQuery: Record<string, string> | undefined;
    const client = createClient({
      'GET /api/v1/veterinarians': ({ url }) => {
        capturedQuery = Object.fromEntries(url.searchParams.entries());
        return { body: { items: [veterinarian()], page: 2, limit: 20, total: 21 } };
      },
    });

    const result = await veterinariansApi.list(
      { page: 2, limit: 20, name: 'sofi', isActive: true },
      client
    );

    expect(capturedQuery).toEqual({ page: '2', limit: '20', name: 'sofi', isActive: 'true' });
    expect(result.items).toHaveLength(1);
  });

  it('gets a veterinarian by id', async () => {
    const client = createClient({
      [`GET /api/v1/veterinarians/${VET_ID}`]: () => ({ body: veterinarian() }),
    });

    const result = await veterinariansApi.getById(VET_ID, client);

    expect(result.id).toBe(VET_ID);
  });

  it('sends the create payload and returns the created veterinarian', async () => {
    let capturedBody: unknown;
    const client = createClient({
      'POST /api/v1/veterinarians': ({ body }) => {
        capturedBody = typeof body === 'string' ? (JSON.parse(body) as unknown) : body;
        return { status: 201, body: veterinarian() };
      },
    });
    const input: CreateVeterinarianRequest = {
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'VET-001',
      userId: USER_ID,
    };

    const result = await veterinariansApi.create(input, client);

    expect(capturedBody).toEqual(input);
    expect(result.id).toBe(VET_ID);
  });

  it('sends a PATCH with the update payload', async () => {
    let captured: { method: string; body: unknown } | undefined;
    const client = createClient({
      [`PATCH /api/v1/veterinarians/${VET_ID}`]: ({ body }) => {
        captured = {
          method: 'PATCH',
          body: typeof body === 'string' ? (JSON.parse(body) as unknown) : body,
        };
        return { body: veterinarian() };
      },
    });

    const result = await veterinariansApi.update(VET_ID, { phone: '+54 11 5555 0202' }, client);

    expect(captured?.method).toBe('PATCH');
    expect(captured?.body).toEqual({ phone: '+54 11 5555 0202' });
    expect(result.id).toBe(VET_ID);
  });

  it('uses the deactivate endpoint', async () => {
    const calls: string[] = [];
    const client = createClient({
      [`POST /api/v1/veterinarians/${VET_ID}/deactivate`]: ({ url }) => {
        calls.push(url.pathname);
        return { status: 204 };
      },
    });

    await veterinariansApi.deactivate(VET_ID, client);

    expect(calls).toEqual([`/api/v1/veterinarians/${VET_ID}/deactivate`]);
  });

  it('uses the reactivate endpoint and returns the veterinarian', async () => {
    let capturedPath: string | undefined;
    const client = createClient({
      [`POST /api/v1/veterinarians/${VET_ID}/reactivate`]: ({ url }) => {
        capturedPath = url.pathname;
        return { status: 200, body: veterinarian() };
      },
    });

    const result = await veterinariansApi.reactivate(VET_ID, client);

    expect(capturedPath).toBe(`/api/v1/veterinarians/${VET_ID}/reactivate`);
    expect(result.id).toBe(VET_ID);
    expect(result.isActive).toBe(true);
  });
});
