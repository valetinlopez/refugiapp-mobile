import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { usersApi } from '../api/usersApi';
import type { UserResponse } from '../types';
import { useUser } from './useUser';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const user: UserResponse = {
  id: USER_ID,
  email: 'manager@refugiapp.local',
  firstName: 'Sofia',
  lastName: 'Ramirez',
  roles: ['shelter_manager'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('useUser', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('resolves a user from the cached list without a detail endpoint', async () => {
    jest.spyOn(usersApi, 'list').mockResolvedValue({ items: [user], page: 1, limit: 20, total: 1 });
    const { result } = await renderHook(() => useUser(USER_ID), { wrapper });

    await waitFor(() => expect(result.current.user).toEqual(user));
    expect(result.current.isError).toBe(false);
  });

  it('reports an invalid identifier without calling the API', async () => {
    const list = jest.spyOn(usersApi, 'list');
    const { result } = await renderHook(() => useUser('invalid'), { wrapper });

    expect(result.current.isError).toBe(true);
    expect(result.current.user).toBeUndefined();
    expect(list).not.toHaveBeenCalled();
  });
});
