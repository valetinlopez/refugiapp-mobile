import { useInfiniteQuery } from '@tanstack/react-query';

import { usersApi } from '../api/usersApi';
import { userKeys } from './userKeys';

const PAGE_SIZE = 20;

export function useUsers(enabled = true) {
  return useInfiniteQuery({
    enabled,
    queryKey: userKeys.lists(),
    queryFn: ({ pageParam }) => usersApi.list(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    retry: 1,
  });
}
