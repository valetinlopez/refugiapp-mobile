import { useQuery } from '@tanstack/react-query';

import { careTasksApi } from '../api/careTasksApi';

import { careTaskKeys } from './careTaskKeys';

export function useCareTaskAnimals() {
  return useQuery({
    queryKey: careTaskKeys.animals,
    queryFn: () => careTasksApi.listAnimalOptions(),
    retry: 1,
  });
}
