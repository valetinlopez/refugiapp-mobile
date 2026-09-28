import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import { useCancelCareTask, useCompleteCareTask } from '../hooks/useCareTaskActions';
import { useCareTasks } from '../hooks/useCareTasks';
import { CareTaskCard } from './CareTaskCard';

export function AnimalCareTasks({
  animalId,
  animalName,
  canWrite,
}: {
  animalId: string;
  animalName: string;
  canWrite: boolean;
}) {
  const query = useCareTasks({ animalId });
  const complete = useCompleteCareTask();
  const cancel = useCancelCareTask();
  const pendingId = complete.variables ?? cancel.variables;

  if (query.isPending) return <LoadingState label="Cargando tareas" />;
  if (query.isError) {
    return (
      <ErrorState
        actionLabel="Reintentar"
        message="No pudimos cargar las tareas de cuidado del animal."
        onAction={() => void query.refetch()}
        title="No se pudieron cargar las tareas"
      />
    );
  }
  if (!query.data?.items.length) {
    return (
      <EmptyState message="Este animal todavía no tiene tareas de cuidado." title="Sin tareas" />
    );
  }

  return (
    <View accessibilityLabel="Tareas de cuidado" style={styles.list}>
      {!canWrite ? (
        <AppText color="textSecondary">
          Tu rol permite consultar estas tareas, pero no modificarlas.
        </AppText>
      ) : null}
      {query.data.items.map((task) => (
        <CareTaskCard
          animalName={animalName}
          canWrite={canWrite}
          isBusy={pendingId === task.id}
          key={task.id}
          onCancel={(id) => cancel.mutate(id)}
          onComplete={(id) => complete.mutate(id)}
          onEdit={(id) => router.push({ pathname: '/care-tasks/[id]/edit', params: { id } })}
          task={task}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ list: { gap: spacing.sm } });
