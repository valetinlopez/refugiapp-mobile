import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { expensesApi } from '../api/expensesApi';
import { dashboardQueryKey, expenseKeys } from './expenseKeys';
import { useDeleteExpense } from './useDeleteExpense';

const EXPENSE_ID = '5fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('useDeleteExpense', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { mutations: { gcTime: 0, retry: false } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('removes the detail and invalidates lists and dashboard after deletion', async () => {
    jest.spyOn(expensesApi, 'remove').mockResolvedValue();
    const remove = jest.spyOn(queryClient, 'removeQueries');
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useDeleteExpense(), { wrapper });

    await act(async () => {
      result.current.mutate(EXPENSE_ID);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(remove).toHaveBeenCalledWith({ queryKey: expenseKeys.detail(EXPENSE_ID) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: expenseKeys.lists() });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: dashboardQueryKey });
  });

  it('does not retry destructive deletions', async () => {
    const remove = jest.spyOn(expensesApi, 'remove').mockRejectedValue(new Error('network'));
    const { result } = await renderHook(() => useDeleteExpense(), { wrapper });

    await act(async () => {
      result.current.mutate(EXPENSE_ID);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
