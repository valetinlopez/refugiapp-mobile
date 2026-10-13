import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalsApi } from '../api/animalsApi';
import { animalKeys } from './animalKeys';

/**
 * Deletes an animal (`DELETE /animals/:id`, `204`).
 *
 * Not optimistic: the backend enforces integrity blocks (under treatment,
 * pending care-tasks, clinical/expense/adoption history) and remains the
 * source of truth. On success the detail query is removed and lists are
 * invalidated by prefix, preserving the backend deterministic order.
 */
export function useDeleteAnimal() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => animalsApi.remove(id),
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: animalKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
    retry: 0,
  });
}
