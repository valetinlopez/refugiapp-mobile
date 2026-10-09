import { useMutation, useQueryClient } from '@tanstack/react-query';

import { medicalRecordsApi } from '../api/medicalRecordsApi';
import { medicalRecordKeys } from './medicalRecordKeys';

/**
 * Soft-deletes a clinical record without optimistic updates. The server remains
 * authoritative; successful deletion removes the cached detail and refreshes
 * every global and per-animal clinical list.
 */
export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => medicalRecordsApi.remove(id),
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: medicalRecordKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() });
    },
    retry: 0,
  });
}
