import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { medicalRecordChangesApi } from './medicalRecordChangesApi';

const ACTOR_UUID = '33333333-3333-4333-8333-333333333333';

function changeDto(overrides: Record<string, unknown> = {}) {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    medicalRecordId: '11111111-1111-4111-8111-111111111111',
    changedByUserId: ACTOR_UUID,
    changeType: 'update',
    changedFields: ['title', 'diagnosis'],
    previousValues: { title: 'Antes', diagnosis: 'Prev' },
    changedAt: '2026-09-29T12:00:00.000Z',
    ...overrides,
  };
}

function client(routes: FakeHttpRoutes): HttpClient {
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

describe('medicalRecordChangesApi', () => {
  it('sends pagination and supported filters', async () => {
    let query: Record<string, string> = {};
    const http = client({
      'GET /api/v1/medical-records/11111111-1111-4111-8111-111111111111/changes': ({ url }) => {
        query = Object.fromEntries(url.searchParams.entries());
        return { body: { items: [changeDto()], page: 2, limit: 20, total: 21 } };
      },
    });
    const result = await medicalRecordChangesApi.listChanges(
      '11111111-1111-4111-8111-111111111111',
      2,
      20,
      { changeType: 'update', from: '2026-09-01T00:00:00Z' },
      http
    );
    expect(query).toEqual({
      page: '2',
      limit: '20',
      changeType: 'update',
      from: '2026-09-01T00:00:00Z',
    });
    expect(result.items[0]?.id).toBe(changeDto().id);
  });

  it('maps an enriched changedBy to display name and initials without email', async () => {
    const http = client({
      'GET /api/v1/medical-records/11111111-1111-4111-8111-111111111111/changes': () => ({
        body: {
          items: [
            changeDto({
              changedBy: { id: ACTOR_UUID, firstName: 'Ana', lastName: 'Ruiz' },
            }),
          ],
          page: 1,
          limit: 20,
          total: 1,
        },
      }),
    });
    const result = await medicalRecordChangesApi.listChanges(
      '11111111-1111-4111-8111-111111111111',
      1,
      20,
      {},
      http
    );
    expect(result.items[0]?.changedBy).toEqual({
      id: ACTOR_UUID,
      displayName: 'Ana Ruiz',
      initials: 'AR',
    });
    expect(result.items[0]?.changedByFallbackId).toBe(ACTOR_UUID);
  });

  it('normalizes a missing actor to null and keeps the fallback id', async () => {
    const http = client({
      'GET /api/v1/medical-records/11111111-1111-4111-8111-111111111111/changes': () => ({
        body: { items: [changeDto({ changedByUserId: null })], page: 1, limit: 20, total: 1 },
      }),
    });
    const result = await medicalRecordChangesApi.listChanges(
      '11111111-1111-4111-8111-111111111111',
      1,
      20,
      {},
      http
    );
    expect(result.items[0]?.changedByUserId).toBeNull();
    expect(result.items[0]?.changedBy).toBeNull();
    expect(result.items[0]?.changedByFallbackId).toBeNull();
  });
});
