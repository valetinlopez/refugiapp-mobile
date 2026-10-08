import { useLocalSearchParams } from 'expo-router';

import { isUuid } from '@/core/validation';
import { CreateCareTaskScreen } from '@/features/care-tasks/components/CreateCareTaskScreen';

export default function CreateCareTaskRoute() {
  const { animalId } = useLocalSearchParams<{ animalId?: string }>();
  const initialAnimalId = typeof animalId === 'string' && isUuid(animalId) ? animalId : undefined;
  return <CreateCareTaskScreen initialAnimalId={initialAnimalId} />;
}
