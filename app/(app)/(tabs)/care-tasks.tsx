import { useLocalSearchParams } from 'expo-router';

import { CareTasksOverviewScreen } from '@/features/care-tasks/components/CareTasksOverviewScreen';
import { isUuid } from '@/features/care-tasks/utils/uuid';

export default function CareTasksRoute() {
  const params = useLocalSearchParams<{ animalId?: string; animalName?: string }>();
  const animalId =
    typeof params.animalId === 'string' && isUuid(params.animalId) ? params.animalId : undefined;

  return (
    <CareTasksOverviewScreen
      initialAnimalId={animalId}
      initialAnimalName={typeof params.animalName === 'string' ? params.animalName : undefined}
    />
  );
}
