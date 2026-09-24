import { router, useLocalSearchParams } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { FilterChip } from '@/components/patterns';
import { AppButton, AppText } from '@/components/primitives';
import { useSession } from '@/features/auth/session';
import { CareTaskCard } from '@/features/care-tasks/components/CareTaskCard';
import { useCareTaskAnimals } from '@/features/care-tasks/hooks/useCareTaskAnimals';
import {
  useCancelCareTask,
  useCompleteCareTask,
} from '@/features/care-tasks/hooks/useCareTaskActions';
import { useCareTasks } from '@/features/care-tasks/hooks/useCareTasks';
import type { CareTask, CareTaskStatus } from '@/features/care-tasks/types';
import { toCareTaskErrorMessage } from '@/features/care-tasks/utils/careTaskErrorMessages';
import { isUuid } from '@/features/care-tasks/utils/uuid';
import { colors, spacing } from '@/theme';

const STATUS_FILTERS: { label: string; value: CareTaskStatus | undefined }[] = [
  { label: 'Todas', value: undefined },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Completadas', value: 'completed' },
  { label: 'Canceladas', value: 'cancelled' },
];

export default function CareTasksScreen() {
  const params = useLocalSearchParams<{ animalId?: string; animalName?: string }>();
  const { user } = useSession();
  const canWrite =
    user?.roles.some((role) => role === 'admin' || role === 'shelter_manager') ?? false;
  const [statusFilter, setStatusFilter] = useState<CareTaskStatus | undefined>(undefined);
  const animalId =
    typeof params.animalId === 'string' && isUuid(params.animalId) ? params.animalId : undefined;
  const tasksQuery = useCareTasks({
    ...(animalId !== undefined ? { animalId } : {}),
    ...(statusFilter !== undefined ? { status: statusFilter } : {}),
  });
  const animalsQuery = useCareTaskAnimals();
  const completeTask = useCompleteCareTask();
  const cancelTask = useCancelCareTask();
  const mutationError = completeTask.error ?? cancelTask.error;
  const { mutate: mutateComplete } = completeTask;
  const { mutate: mutateCancel } = cancelTask;
  const pendingActionId = completeTask.isPending
    ? completeTask.variables
    : cancelTask.isPending
      ? cancelTask.variables
      : null;
  const names = useMemo(
    () => new Map(animalsQuery.data?.map((animal) => [animal.id, animal.name]) ?? []),
    [animalsQuery.data]
  );
  const handleComplete = useCallback((id: string) => mutateComplete(id), [mutateComplete]);
  const handleCancel = useCallback((id: string) => mutateCancel(id), [mutateCancel]);
  const handleEdit = useCallback(
    (id: string) => router.push({ pathname: '/care-tasks/[id]/edit', params: { id } }),
    []
  );
  const renderItem = useCallback(
    ({ item }: { item: CareTask }) => (
      <TaskItem
        animalName={names.get(item.animalId) ?? 'Animal'}
        busy={pendingActionId === item.id}
        canWrite={canWrite}
        onCancel={handleCancel}
        onComplete={handleComplete}
        onEdit={handleEdit}
        task={item}
      />
    ),
    [canWrite, handleCancel, handleComplete, handleEdit, names, pendingActionId]
  );

  const header = (
    <View style={styles.header}>
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          <AppText variant="heading1">Tareas de cuidado</AppText>
          <AppText color="textSecondary">
            {animalId
              ? `Filtradas por ${typeof params.animalName === 'string' ? params.animalName : 'animal'}`
              : 'Todas las tareas del refugio'}
          </AppText>
        </View>
        {canWrite ? (
          <AppButton
            label="Nueva tarea"
            onPress={() =>
              router.push({ pathname: '/care-tasks/new', params: animalId ? { animalId } : {} })
            }
          />
        ) : null}
      </View>
      {!canWrite ? (
        <AppText color="textSecondary">
          Tu rol permite consultar tareas, pero no crearlas, completarlas ni cancelarlas.
        </AppText>
      ) : null}
      {animalId ? (
        <AppButton
          label="Ver todas"
          onPress={() => router.setParams({ animalId: undefined, animalName: undefined })}
          variant="ghost"
        />
      ) : null}
      <ScrollView
        accessibilityLabel="Filtrar por estado"
        contentContainerStyle={styles.filters}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {STATUS_FILTERS.map(({ label, value }) => (
          <FilterChip
            key={label}
            label={label}
            onPress={() => setStatusFilter(value)}
            selected={statusFilter === value}
          />
        ))}
      </ScrollView>
      {mutationError ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {toCareTaskErrorMessage(mutationError)}
        </AppText>
      ) : null}
    </View>
  );

  if (tasksQuery.isPending) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.state}>
          <LoadingState label="Cargando tareas" />
        </View>
      </SafeAreaView>
    );
  }

  if (tasksQuery.isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.state}>
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos cargar las tareas. Revisa tu conexión."
            onAction={() => void tasksQuery.refetch()}
            title="No se pudieron cargar las tareas"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.list}
        data={tasksQuery.data.items}
        keyExtractor={(task) => task.id}
        ListEmptyComponent={
          <EmptyState
            message={animalId ? 'Este animal todavía no tiene tareas.' : 'Todavía no hay tareas.'}
            title="Sin tareas"
          />
        }
        ListHeaderComponent={header}
        onRefresh={() => void tasksQuery.refetch()}
        refreshing={tasksQuery.isRefetching}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const TaskItem = memo(function TaskItem({
  animalName,
  busy,
  canWrite,
  onCancel,
  onComplete,
  onEdit,
  task,
}: {
  animalName: string;
  busy: boolean;
  canWrite: boolean;
  onCancel(id: string): void;
  onComplete(id: string): void;
  onEdit(id: string): void;
  task: CareTask;
}) {
  return (
    <CareTaskCard
      animalName={animalName}
      canWrite={canWrite}
      isBusy={busy}
      onCancel={onCancel}
      onComplete={onComplete}
      onEdit={onEdit}
      task={task}
    />
  );
});

const styles = StyleSheet.create({
  filters: { gap: spacing.xs, paddingVertical: spacing.xs },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  heading: { flex: 1, gap: spacing.xxs },
  headingRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  list: { backgroundColor: colors.background, flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  state: { flex: 1, justifyContent: 'center', padding: spacing.lg },
});
