import type { QueryClient } from '@tanstack/react-query';

import { careTaskKeys, dashboardQueryKey, homeQueryKey } from './careTaskKeys';

export async function invalidateCareTaskQueries(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: careTaskKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardQueryKey }),
    queryClient.invalidateQueries({ queryKey: homeQueryKey }),
  ]);
}
