import { ApiError, createHttpClient, type HttpClient } from '@/core/api';
import { createFakeHttpTransport, type FakeHttpRoutes } from '@/core/api/testing/fakeHttpTransport';

import { expensesApi } from './expensesApi';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const EXPENSE_ID = '5fa85f64-5717-4562-b3fc-2c963f66afa6';

const EMPTY_PAGE = { items: [], page: 1, limit: 20, total: 0 };

function response() {
  return {
    id: EXPENSE_ID,
    animalId: ANIMAL_ID,
    category: 'veterinary' as const,
    amountCents: 125050,
    currency: 'ARS',
    description: 'Consulta de control',
    ticketMediaId: EXPENSE_ID,
    createdByUserId: EXPENSE_ID,
    incurredAt: '2026-09-20T10:00:00.000Z',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  };
}

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

describe('expensesApi.list', () => {
  it('sends the documented filters and pagination to GET /expenses', async () => {
    const client = createClient({
      'GET /api/v1/expenses': (request) => {
        expect(request.url.searchParams.get('page')).toBe('2');
        expect(request.url.searchParams.get('limit')).toBe('20');
        expect(request.url.searchParams.get('animalId')).toBe(ANIMAL_ID);
        expect(request.url.searchParams.get('category')).toBe('veterinary');
        expect(request.url.searchParams.get('from')).toBe('2026-09-01T03:00:00.000Z');
        expect(request.url.searchParams.get('to')).toBe('2026-09-30T23:59:59.999-03:00');
        return { body: { ...EMPTY_PAGE, page: 2 } };
      },
    });

    await expensesApi.list(
      {
        animalId: ANIMAL_ID,
        category: 'veterinary',
        from: '2026-09-01T03:00:00.000Z',
        to: '2026-09-30T23:59:59.999-03:00',
      },
      2,
      20,
      client
    );
  });

  it('omits absent filters as undefined params', async () => {
    const client = createClient({
      'GET /api/v1/expenses': (request) => {
        expect(request.url.searchParams.has('animalId')).toBe(false);
        expect(request.url.searchParams.has('category')).toBe(false);
        expect(request.url.searchParams.has('from')).toBe(false);
        expect(request.url.searchParams.has('to')).toBe(false);
        return { body: EMPTY_PAGE };
      },
    });

    await expensesApi.list({}, 1, 20, client);
  });
});

describe('expensesApi.getById', () => {
  it('maps the detail DTO to the view model keeping cents as integers', async () => {
    const client = createClient({
      [`GET /api/v1/expenses/${EXPENSE_ID}`]: () => ({ body: response() }),
    });

    const expense = await expensesApi.getById(EXPENSE_ID, client);

    expect(expense).toEqual({
      id: EXPENSE_ID,
      animalId: ANIMAL_ID,
      category: 'veterinary',
      amountCents: 125050,
      currency: 'ARS',
      description: 'Consulta de control',
      ticketMediaId: EXPENSE_ID,
      incurredAt: '2026-09-20T10:00:00.000Z',
      createdAt: '2026-09-20T10:00:00.000Z',
      updatedAt: '2026-09-20T10:00:00.000Z',
      createdByUserId: EXPENSE_ID,
    });
  });

  it('normalizes a null actor to null without leaking a placeholder', async () => {
    const client = createClient({
      [`GET /api/v1/expenses/${EXPENSE_ID}`]: () => ({
        body: { ...response(), createdByUserId: null },
      }),
    });

    const expense = await expensesApi.getById(EXPENSE_ID, client);

    expect(expense.createdByUserId).toBeNull();
  });

  it('normalizes a missing receipt to null', async () => {
    const client = createClient({
      [`GET /api/v1/expenses/${EXPENSE_ID}`]: () => ({
        body: { ...response(), ticketMediaId: null },
      }),
    });

    const expense = await expensesApi.getById(EXPENSE_ID, client);

    expect(expense.ticketMediaId).toBeNull();
  });

  it('propagates a 404 as a normalized ApiError', async () => {
    const client = createClient({
      [`GET /api/v1/expenses/${EXPENSE_ID}`]: () => ({
        body: { code: 'EXPENSE_NOT_FOUND' },
        status: 404,
      }),
    });

    await expect(expensesApi.getById(EXPENSE_ID, client)).rejects.toMatchObject({ status: 404 });
  });

  it('propagates a 403 as a normalized ApiError', async () => {
    const client = createClient({
      [`GET /api/v1/expenses/${EXPENSE_ID}`]: () => ({
        body: { code: 'FORBIDDEN' },
        status: 403,
      }),
    });

    await expect(expensesApi.getById(EXPENSE_ID, client)).rejects.toBeInstanceOf(ApiError);
    await expect(expensesApi.getById(EXPENSE_ID, client)).rejects.toMatchObject({ status: 403 });
  });
});

describe('expensesApi.remove', () => {
  it('soft-deletes through DELETE /expenses/:id and resolves without a body', async () => {
    let method: string | undefined;
    let pathname: string | undefined;
    const client = createClient({
      [`DELETE /api/v1/expenses/${EXPENSE_ID}`]: (request) => {
        method = request.method;
        pathname = request.url.pathname;
        return { status: 204 };
      },
    });

    await expect(expensesApi.remove(EXPENSE_ID, client)).resolves.toBeUndefined();
    expect(method).toBe('DELETE');
    expect(pathname).toBe(`/api/v1/expenses/${EXPENSE_ID}`);
  });

  it('propagates a 404 when the expense is already gone', async () => {
    const client = createClient({
      [`DELETE /api/v1/expenses/${EXPENSE_ID}`]: () => ({
        body: { code: 'EXPENSE_NOT_FOUND' },
        status: 404,
      }),
    });

    await expect(expensesApi.remove(EXPENSE_ID, client)).rejects.toMatchObject({ status: 404 });
  });

  it('propagates a 403 when the role cannot delete', async () => {
    const client = createClient({
      [`DELETE /api/v1/expenses/${EXPENSE_ID}`]: () => ({
        body: { code: 'FORBIDDEN' },
        status: 403,
      }),
    });

    await expect(expensesApi.remove(EXPENSE_ID, client)).rejects.toMatchObject({ status: 403 });
  });
});
