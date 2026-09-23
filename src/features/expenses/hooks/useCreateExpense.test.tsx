import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { expenseReceiptApi } from '../api/expenseReceiptApi';
import { expensesApi } from '../api/expensesApi';
import { dashboardQueryKey, expenseKeys } from './expenseKeys';
import { useCreateExpense } from './useCreateExpense';

describe('useCreateExpense', () => {
  it('invalidates expense lists and dashboard after creation', async () => {
    jest.spyOn(expenseReceiptApi, 'upload').mockResolvedValue({ id: 'media-id' });
    jest.spyOn(expensesApi, 'create').mockResolvedValue({} as never);
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = jest.spyOn(client, 'invalidateQueries');
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = await renderHook(() => useCreateExpense(), { wrapper });
    act(() =>
      result.current.mutate({
        form: {
          animalId: '9aa98390-2695-4d5b-86e8-e043410a7fe8',
          category: 'food',
          description: 'Alimento',
          amountCents: '100',
          incurredAt: '2026-09-23',
        },
        receipt: { uri: 'file://ticket.pdf', name: 'ticket.pdf', mimeType: 'application/pdf' },
      })
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: expenseKeys.lists() });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: dashboardQueryKey });
  });
});
