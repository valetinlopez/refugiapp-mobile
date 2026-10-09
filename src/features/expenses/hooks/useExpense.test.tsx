import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { expensesApi } from '../api/expensesApi';
import { expenseKeys } from './expenseKeys';
import { useExpense } from './useExpense';

const EXPENSE_ID = '5fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('useExpense', () => {
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

  it('fetches the expense detail with its own query key', async () => {
    const getById = jest.spyOn(expensesApi, 'getById').mockResolvedValue({
      id: EXPENSE_ID,
      animalId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      category: 'food',
      amountCents: 1000,
      currency: 'ARS',
      description: 'Concepto',
      ticketMediaId: null,
      incurredAt: '2026-09-22T12:00:00.000Z',
      createdAt: '2026-09-22T12:00:00.000Z',
      updatedAt: '2026-09-22T12:00:00.000Z',
      createdByUserId: null,
    });
    const { result } = await renderHook(() => useExpense(EXPENSE_ID), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getById).toHaveBeenCalledWith(EXPENSE_ID);
    expect(queryClient.getQueryData(expenseKeys.detail(EXPENSE_ID))).toBeDefined();
  });

  it('does not fetch when the route id is invalid', async () => {
    const getById = jest.spyOn(expensesApi, 'getById');

    await renderHook(() => useExpense(''), { wrapper });

    expect(getById).not.toHaveBeenCalled();
  });
});
