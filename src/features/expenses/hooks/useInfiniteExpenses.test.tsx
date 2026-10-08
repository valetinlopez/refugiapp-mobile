import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { expensesApi } from '../api/expensesApi';
import type { Expense, PaginatedExpenses } from '../types';
import { flattenExpensePages, useInfiniteExpenses } from './useInfiniteExpenses';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createExpense(id: string): Expense {
  return {
    id,
    animalId: ANIMAL_ID,
    category: 'food',
    amountCents: 1000,
    currency: 'ARS',
    description: 'Concepto',
    ticketMediaId: null,
    incurredAt: '2026-09-22T12:00:00.000Z',
  };
}

function createPage(page = 1, total = 1): PaginatedExpenses {
  return { items: [createExpense(`${String(page)}-expense`)], page, limit: 20, total };
}

describe('useInfiniteExpenses', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: 0, retry: false } } });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('loads the global list in deterministic pages of 20', async () => {
    const list = jest
      .spyOn(expensesApi, 'list')
      .mockResolvedValueOnce(createPage(1, 21))
      .mockResolvedValueOnce(createPage(2, 21));
    const filters = { animalId: ANIMAL_ID, category: 'food' as const };
    const { result } = await renderHook(() => useInfiniteExpenses(filters), { wrapper });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(list).toHaveBeenNthCalledWith(1, filters, 1, 20);
    expect(list).toHaveBeenNthCalledWith(2, filters, 2, 20);
    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });
});

describe('flattenExpensePages', () => {
  it('deduplicates overlapping ids while preserving backend order', () => {
    const first = createPage(1, 2);
    const repeated = first.items[0]!;
    const second: PaginatedExpenses = {
      ...createPage(2, 2),
      items: [repeated, createExpense('unique-expense')],
    };

    expect(flattenExpensePages([first, second]).map((expense) => expense.id)).toEqual([
      repeated.id,
      'unique-expense',
    ]);
  });

  it('returns an empty list when there are no pages', () => {
    expect(flattenExpensePages(undefined)).toEqual([]);
  });
});
