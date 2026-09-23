import type { QueryClient } from '@tanstack/react-query';

import { medicalRecordKeys } from './medicalRecordKeys';

export async function invalidateMedicalRecordQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() });
}
