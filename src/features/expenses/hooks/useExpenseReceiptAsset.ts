import { useQuery } from '@tanstack/react-query';

import { getExpenseReceipt } from '../api/expenseMediaApi';
import { toExpenseReceipt } from '../types';
import { expenseKeys } from './expenseKeys';

const RECEIPT_STALE_TIME = 5 * 60 * 1000;

/**
 * Full receipt asset for the detail screen.
 *
 * Shares the `expenseKeys.media` cache entry with `useExpenseReceipt` (which
 * only selects the URL) so the media is fetched once. Returns the mapped
 * `ExpenseReceipt` with `bytes`/`format` normalized for presentation.
 */
export function useExpenseReceiptAsset(mediaId: string | null) {
  return useQuery({
    queryKey: expenseKeys.media(mediaId ?? ''),
    queryFn: () => getExpenseReceipt(mediaId as string),
    enabled: mediaId !== null,
    retry: 1,
    staleTime: RECEIPT_STALE_TIME,
    select: toExpenseReceipt,
  });
}
