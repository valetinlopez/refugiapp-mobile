import { expensesApi } from './expensesApi';

const EMPTY_PAGE = { items: [], page: 1, limit: 20, total: 0 };

describe('expensesApi.list', () => {
  it('sends the documented filters and pagination to GET /expenses', async () => {
    const get = jest.fn().mockResolvedValue({ data: { ...EMPTY_PAGE, page: 2 } });

    await expensesApi.list(
      {
        animalId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        category: 'veterinary',
        from: '2026-09-01T03:00:00.000Z',
        to: '2026-09-30T23:59:59.999-03:00',
      },
      2,
      20,
      { get } as never
    );

    expect(get).toHaveBeenCalledWith('/expenses', {
      params: {
        page: 2,
        limit: 20,
        animalId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        category: 'veterinary',
        from: '2026-09-01T03:00:00.000Z',
        to: '2026-09-30T23:59:59.999-03:00',
      },
    });
  });

  it('omits absent filters as undefined params', async () => {
    const get = jest.fn().mockResolvedValue({ data: EMPTY_PAGE });

    await expensesApi.list({}, 1, 20, { get } as never);

    expect(get).toHaveBeenCalledWith('/expenses', {
      params: {
        page: 1,
        limit: 20,
        animalId: undefined,
        category: undefined,
        from: undefined,
        to: undefined,
      },
    });
  });
});
