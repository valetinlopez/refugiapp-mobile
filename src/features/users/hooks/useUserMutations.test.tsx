import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { usersApi } from '../api/usersApi';
import type { CreateUserRequest, UserResponse } from '../types';
import { userKeys } from './userKeys';
import { useActivateUser, useCreateUser, useDeactivateUser } from './useUserMutations';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const createInput: CreateUserRequest = {
  email: 'admin@refugiapp.local',
  firstName: 'Ana',
  lastName: 'Perez',
  password: 'secure-pass-123',
  roles: ['admin'],
};
const createdUser: UserResponse = {
  id: USER_ID,
  email: createInput.email,
  firstName: createInput.firstName,
  lastName: createInput.lastName,
  roles: ['admin'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('user mutations', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false, gcTime: 0 }, queries: { retry: false } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it.each([
    ['create', useCreateUser, createInput],
    ['activate', useActivateUser, USER_ID],
    ['deactivate', useDeactivateUser, USER_ID],
  ] as const)(
    'invalidates the users list after %s succeeds',
    async (method, useMutation, input) => {
      const response = method === 'deactivate' ? undefined : createdUser;
      jest.spyOn(usersApi, method).mockResolvedValue(response as never);
      const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
      const { result } = await renderHook(() => useMutation(), { wrapper });

      result.current.mutate(input as never);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidate).toHaveBeenCalledWith({ queryKey: userKeys.lists() });
    }
  );
});
