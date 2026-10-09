import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { expenseReceiptApi } from '../api/expenseReceiptApi';
import { expensesApi } from '../api/expensesApi';
import type { ReceiptFile } from '../types';
import { dashboardQueryKey, expenseKeys } from './expenseKeys';
import { useCreateExpense } from './useCreateExpense';

const form = {
  animalId: '9aa98390-2695-4d5b-86e8-e043410a7fe8',
  category: 'food' as const,
  description: 'Alimento',
  amountUnits: '48.500,00',
  incurredAt: '2026-09-23T10:30:00-03:00',
};

const receipt: ReceiptFile = {
  uri: 'file://ticket.pdf',
  name: 'ticket.pdf',
  mimeType: 'application/pdf',
};

describe('useCreateExpense', () => {
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
    queryClient?.clear();
    queryClient?.unmount();
    jest.restoreAllMocks();
  });

  it('invalidates expense lists and dashboard after creation', async () => {
    jest.spyOn(expensesApi, 'create').mockResolvedValue({} as never);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useCreateExpense(), { wrapper });
    await act(async () => {
      result.current.mutate({ form, receipt: null });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: expenseKeys.lists() });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: dashboardQueryKey });
  });

  it('creates without uploading a receipt when none was attached', async () => {
    const upload = jest.spyOn(expenseReceiptApi, 'upload').mockResolvedValue({ id: 'media-id' });
    const create = jest.spyOn(expensesApi, 'create').mockResolvedValue({} as never);
    const { result } = await renderHook(() => useCreateExpense(), { wrapper });
    await act(async () => {
      result.current.mutate({ form, receipt: null });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(upload).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 4_850_000, currency: 'ARS' })
    );
    expect(create.mock.calls[0]?.[0]).not.toHaveProperty('ticketMediaId');
  });

  it('uploads the receipt and links its media id when attached', async () => {
    const upload = jest.spyOn(expenseReceiptApi, 'upload').mockResolvedValue({ id: 'media-id' });
    const create = jest.spyOn(expensesApi, 'create').mockResolvedValue({} as never);
    const { result } = await renderHook(() => useCreateExpense(), { wrapper });
    await act(async () => {
      result.current.mutate({ form, receipt });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(upload).toHaveBeenCalled();
    expect(create.mock.calls[0]?.[0]?.ticketMediaId).toBe('media-id');
  });

  it('deletes the orphan media best-effort when creation fails after upload', async () => {
    jest.spyOn(expenseReceiptApi, 'upload').mockResolvedValue({ id: 'media-id' });
    jest.spyOn(expensesApi, 'create').mockRejectedValue(new Error('boom'));
    const removeOrphan = jest.spyOn(expenseReceiptApi, 'delete').mockResolvedValue();
    const { result } = await renderHook(() => useCreateExpense(), { wrapper });
    await act(async () => {
      result.current.mutate({ form, receipt });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(removeOrphan).toHaveBeenCalledWith('media-id');
  });

  it('provides upload progress while the receipt is uploading', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    jest.spyOn(expenseReceiptApi, 'upload').mockImplementation(async (_file, _client, options) => {
      options?.onUploadProgress?.(0.5);
      await gate;
      return { id: 'media-id' };
    });
    jest.spyOn(expensesApi, 'create').mockResolvedValue({} as never);
    const { result } = await renderHook(() => useCreateExpense(), { wrapper });
    await act(async () => {
      result.current.mutate({ form, receipt });
    });
    await waitFor(() => expect(result.current.uploadProgress).toBe(0.5));
    await act(async () => {
      release();
    });
  });
});
