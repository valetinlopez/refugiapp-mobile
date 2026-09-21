import { createAppQueryClient } from './queryClient';

describe('createAppQueryClient', () => {
  it('retries idempotent queries once and enables native refetch triggers', () => {
    const options = createAppQueryClient().getDefaultOptions();

    expect(options.queries).toMatchObject({
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      retry: 1,
    });
    expect(options.mutations?.retry).toBe(false);
  });
});
