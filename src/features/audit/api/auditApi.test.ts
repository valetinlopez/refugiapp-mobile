import { createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import type { AuditLogResponse, PaginatedAuditLogsResponse } from '../types';
import { toAuditLogView, toPaginatedAuditLogsView } from '../types';
import { auditApi } from './auditApi';

const ACTOR_ID = '44444444-4444-4444-8444-444444444444';

function dto(overrides: Partial<AuditLogResponse> = {}): AuditLogResponse {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    actorUserId: ACTOR_ID,
    action: 'access.denied',
    resourceType: 'authorization',
    resourceId: null,
    metadata: {},
    occurredAt: '2026-09-29T12:00:00.000Z',
    createdAt: '2026-09-29T12:00:00.000Z',
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

describe('auditApi', () => {
  it('sends pagination and supported filters', async () => {
    let query: Record<string, string> = {};
    const http = client({
      'GET /api/v1/audit-logs': ({ url }) => {
        query = Object.fromEntries(url.searchParams.entries());
        return { body: { items: [dto()], page: 2, limit: 20, total: 21 } };
      },
    });
    await auditApi.list(
      2,
      20,
      {
        action: 'access.denied',
        resourceType: 'authorization',
        resourceId: '55555555-5555-4555-8555-555555555555',
        actorUserId: '44444444-4444-4444-8444-444444444444',
        from: '2026-09-01T00:00:00Z',
        to: '2026-09-02T23:59:00Z',
      },
      http
    );
    expect(query).toEqual({
      page: '2',
      limit: '20',
      action: 'access.denied',
      resourceType: 'authorization',
      resourceId: '55555555-5555-4555-8555-555555555555',
      actorUserId: '44444444-4444-4444-8444-444444444444',
      from: '2026-09-01T00:00:00Z',
      to: '2026-09-02T23:59:00Z',
    });
  });

  it('loads one audit entry by id', async () => {
    const http = client({ [`GET /api/v1/audit-logs/${dto().id}`]: () => ({ body: dto() }) });
    await expect(auditApi.detail(dto().id, http)).resolves.toEqual(toAuditLogView(dto()));
  });
});

describe('toAuditLogView', () => {
  it('maps a complete actor to display name, initials and email', () => {
    const view = toAuditLogView(
      dto({
        actor: {
          id: ACTOR_ID,
          firstName: 'María',
          lastName: 'López',
          email: 'maria@refugiapp.local',
        },
      })
    );
    expect(view.actor).toEqual({
      id: ACTOR_ID,
      displayName: 'María López',
      initials: 'ML',
      email: 'maria@refugiapp.local',
    });
    expect(view.actorFallbackId).toBe(ACTOR_ID);
  });

  it('keeps the fallback UUID when actor is absent during rollout', () => {
    const view = toAuditLogView(dto({ actor: null }));
    expect(view.actor).toBeNull();
    expect(view.actorFallbackId).toBe(ACTOR_ID);
  });

  it('normalizes null actor and resource id to null', () => {
    const view = toAuditLogView(dto({ actorUserId: null, actor: null, resourceId: null }));
    expect(view.actor).toBeNull();
    expect(view.actorFallbackId).toBeNull();
    expect(view.resourceId).toBeNull();
  });
});

describe('toPaginatedAuditLogsView', () => {
  it('maps every item', () => {
    const payload: PaginatedAuditLogsResponse = {
      items: [
        dto({
          actor: {
            id: ACTOR_ID,
            firstName: 'María',
            lastName: 'López',
            email: 'maria@refugiapp.local',
          },
        }),
        dto({ actor: null }),
      ],
      page: 1,
      limit: 20,
      total: 2,
    };
    const view = toPaginatedAuditLogsView(payload);
    expect(view.items).toHaveLength(2);
    expect(view.items[0]?.actor?.displayName).toBe('María López');
    expect(view.items[1]?.actor).toBeNull();
  });
});
