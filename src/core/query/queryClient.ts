import { QueryClient } from '@tanstack/react-query';

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  });
}
