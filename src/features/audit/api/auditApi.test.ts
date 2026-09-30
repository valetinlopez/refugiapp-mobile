import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import type { AuditLog } from '../types';
import { auditApi } from './auditApi';

const ENTRY: AuditLog = {
  id: '11111111-1111-4111-8111-111111111111',
  actorUserId: null,
  action: 'access.denied',
  resourceType: 'authorization',
  resourceId: null,
  metadata: {},
  occurredAt: '2026-09-29T12:00:00.000Z',
  createdAt: '2026-09-29T12:00:00.000Z',
};

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

describe('auditApi', () => {
  it('sends pagination and supported filters', async () => {
    let query: Record<string, string> = {};
    const http = client({
      'GET /api/v1/audit-logs': ({ url }) => {
        query = Object.fromEntries(url.searchParams.entries());
        return { body: { items: [ENTRY], page: 2, limit: 20, total: 21 } };
      },
    });
    await auditApi.list(2, 20, { action: 'access.denied', from: '2026-09-01T00:00:00Z' }, http);
    expect(query).toEqual({
      page: '2',
      limit: '20',
      action: 'access.denied',
      from: '2026-09-01T00:00:00Z',
    });
  });

  it('loads one audit entry by id', async () => {
    const http = client({ [`GET /api/v1/audit-logs/${ENTRY.id}`]: () => ({ body: ENTRY }) });
    await expect(auditApi.detail(ENTRY.id, http)).resolves.toEqual(ENTRY);
  });
});
