import { router } from 'expo-router';
import { AccessibilityInfo, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { DecorativeBackground, ScreenHeader } from '@/components/patterns';
import { AppText } from '@/components/primitives';
import { isNetworkError, useMutationRetryQueue } from '@/core/network';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

import { useCancelCareTask, useCompleteCareTask } from '../hooks/useCareTaskActions';
import { useCareTask } from '../hooks/useCareTask';
import { useCareTaskAnimal } from '../hooks/useCareTaskAnimal';
import { toCareTaskErrorMessage } from '../utils/careTaskErrorMessages';
import { CareTaskDetail } from './CareTaskDetail';

export interface CareTaskDetailScreenProps {
  taskId: string;
}

export function CareTaskDetailScreen({ taskId }: CareTaskDetailScreenProps) {
  const { canEditAnimal: canWrite } = useCapabilities();
  const taskQuery = useCareTask(taskId);
  const task = taskQuery.data;
  const animalQuery = useCareTaskAnimal(task?.animalId);
  const retryQueue = useMutationRetryQueue();
  const completeTask = useCompleteCareTask(retryQueue.queue);
  const cancelTask = useCancelCareTask(retryQueue.queue);
  const isBusy = completeTask.isPending || cancelTask.isPending;
  const loadError = taskQuery.error ?? animalQuery.error;

  function retry(): void {
    void taskQuery.refetch();
    if (task !== undefined) void animalQuery.refetch();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground variant="texture" />
      <AccountHeaderRow accessibilityHint="Volver a Cuidados" fallbackHref="/care-tasks" />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText color="textSecondary" variant="label">
          Cuidados
        </AppText>
        <ScreenHeader title="Detalle del cuidado" titleVariant="display" />

        {taskId === '' ? (
          <EmptyState
            actionLabel="Volver"
            message="La tarea solicitada no es válida."
            onAction={() => navigateBack('/care-tasks')}
            title="Tarea no encontrada"
          />
        ) : null}
        {taskId !== '' && (taskQuery.isPending || (task !== undefined && animalQuery.isPending)) ? (
          <LoadingState label="Cargando detalle del cuidado" />
        ) : null}
        {taskId !== '' && (taskQuery.isError || (task !== undefined && animalQuery.isError)) ? (
          isNetworkError(loadError) ? (
            <OfflineState
              actionLabel="Reintentar"
              message="Conectate a internet para cargar el detalle del cuidado."
              onAction={retry}
              testID="care-task-detail-offline"
              title="Sin conexión"
            />
          ) : (
            <ErrorState
              actionLabel="Reintentar"
              message="No pudimos cargar la tarea. Puede que ya no exista."
              onAction={retry}
              title="No se pudo cargar"
            />
          )
        ) : null}

        {task && animalQuery.data ? (
          <CareTaskDetail
            animal={animalQuery.data}
            canWrite={canWrite}
            errorMessage={
              completeTask.isError || cancelTask.isError
                ? toCareTaskErrorMessage(completeTask.error ?? cancelTask.error)
                : null
            }
            isBusy={isBusy}
            onCancel={(id) =>
              cancelTask.mutate(id, {
                onSuccess: () => AccessibilityInfo.announceForAccessibility('Tarea cancelada.'),
              })
            }
            onComplete={(id) =>
              completeTask.mutate(id, {
                onSuccess: () => AccessibilityInfo.announceForAccessibility('Tarea completada.'),
              })
            }
            onEdit={(id) => router.push({ pathname: '/care-tasks/[id]/edit', params: { id } })}
            onOpenAnimal={(id) => router.push({ pathname: '/animals/[id]', params: { id } })}
            pendingSyncCount={retryQueue.pendingCount}
            task={task}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg, paddingBottom: spacing['3xl'] },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
