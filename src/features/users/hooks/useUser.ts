import { useMemo } from 'react';

import { isUuid } from '@/core/validation';

import type { UserResponse } from '../types';
import { useUsers } from './useUsers';

interface UseUserResult {
  error: unknown;
  isError: boolean;
  isPending: boolean;
  refetch: () => void;
  user: UserResponse | undefined;
}

export function useUser(id: string): UseUserResult {
  const validId = isUuid(id);
  const usersQuery = useUsers(validId);
  const user = useMemo(
    () => usersQuery.data?.pages.flatMap((page) => page.items).find((item) => item.id === id),
    [usersQuery.data, id]
  );

  return {
    user,
    error: usersQuery.error,
    isPending: validId && usersQuery.isPending,
    isError: !validId || usersQuery.isError,
    refetch: () => {
      void usersQuery.refetch();
    },
  };
}
