import { useLocalSearchParams } from 'expo-router';

import { CareTaskDetailScreen } from '@/features/care-tasks/components/CareTaskDetailScreen';
import { isUuid } from '@/features/care-tasks/utils/uuid';

export default function CareTaskDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = typeof id === 'string' && isUuid(id) ? id : '';
  return <CareTaskDetailScreen taskId={taskId} />;
}
