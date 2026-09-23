import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { UploadCancelledError } from '@/core/media';

import { expenseReceiptApi } from '../api/expenseReceiptApi';
import { expensesApi } from '../api/expensesApi';
import type { ExpenseResponse, ReceiptFile } from '../types';
import type { ExpenseFormValues } from '../utils/expenseSchema';
import { toCreateExpenseRequest } from '../utils/toCreateExpenseRequest';
import { dashboardQueryKey, expenseKeys } from './expenseKeys';

export interface CreateExpenseInput {
  form: ExpenseFormValues;
  receipt: ReceiptFile;
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const controller = useRef<AbortController | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const mutation = useMutation<ExpenseResponse, Error, CreateExpenseInput>({
    mutationFn: async ({ form, receipt }) => {
      controller.current = new AbortController();
      let mediaId: string | undefined;
      try {
        const media = await expenseReceiptApi.upload(receipt, undefined, {
          signal: controller.current.signal,
          onUploadProgress: setUploadProgress,
        });
        mediaId = media.id;
        return await expensesApi.create(toCreateExpenseRequest(form, mediaId));
      } catch (error) {
        if (mediaId) await expenseReceiptApi.delete(mediaId).catch(() => undefined);
        if (controller.current.signal.aborted) throw new UploadCancelledError();
        throw error instanceof Error ? error : new Error('No se pudo registrar el gasto.');
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKey }),
      ]);
    },
    onSettled: () => {
      controller.current = null;
      setUploadProgress(null);
    },
  });

  return { ...mutation, cancelUpload: () => controller.current?.abort(), uploadProgress };
}
