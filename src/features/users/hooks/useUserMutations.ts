import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usersApi } from '../api/usersApi';
import type { CreateUserRequest, UpdateUserRequest, UserResponse } from '../types';
import { userKeys } from './userKeys';

export interface UpdateUserInput {
  data: UpdateUserRequest;
  id: string;
}

async function invalidateUsers(queryClient: ReturnType<typeof useQueryClient>): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation<UserResponse, Error, CreateUserRequest>({
    mutationFn: (input) => usersApi.create(input),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation<UserResponse, Error, UpdateUserInput>({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation<UserResponse, Error, string>({
    mutationFn: (id) => usersApi.activate(id),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => usersApi.deactivate(id),
    onSuccess: () => invalidateUsers(queryClient),
  });
}
