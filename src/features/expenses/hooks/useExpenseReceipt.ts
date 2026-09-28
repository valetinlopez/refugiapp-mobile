import { useQuery } from '@tanstack/react-query';

import { getExpenseReceipt } from '../api/expenseMediaApi';
import { expenseKeys } from './expenseKeys';

export function useExpenseReceipt(mediaId: string | null) {
  return useQuery({
    queryKey: expenseKeys.media(mediaId ?? ''),
    queryFn: () => getExpenseReceipt(mediaId as string),
    enabled: mediaId !== null,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    select: (asset) => asset.secureUrl,
  });
}
