import { useMutation, useQueryClient } from '@tanstack/react-query';

import { veterinariansApi } from '../api/veterinariansApi';
import type { CreateVeterinarianRequest, UpdateVeterinarianRequest } from '../types';
import { veterinarianKeys } from './veterinarianKeys';

async function invalidateVeterinarians(
  queryClient: ReturnType<typeof useQueryClient>
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: veterinarianKeys.all });
}

export function useCreateVeterinarian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVeterinarianRequest) => veterinariansApi.create(input),
    onSuccess: () => invalidateVeterinarians(queryClient),
  });
}

export function useUpdateVeterinarian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVeterinarianRequest }) =>
      veterinariansApi.update(id, input),
    onSuccess: () => invalidateVeterinarians(queryClient),
  });
}

export function useDeactivateVeterinarian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => veterinariansApi.deactivate(id),
    onSuccess: () => invalidateVeterinarians(queryClient),
  });
}
