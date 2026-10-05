import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AppText } from '@/components/primitives';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { CareTaskCard } from '@/features/care-tasks/components/CareTaskCard';
import {
  useCancelCareTask,
  useCompleteCareTask,
} from '@/features/care-tasks/hooks/useCareTaskActions';
import { useCareTask } from '@/features/care-tasks/hooks/useCareTask';
import { useCareTaskAnimals } from '@/features/care-tasks/hooks/useCareTaskAnimals';
import { toCareTaskErrorMessage } from '@/features/care-tasks/utils/careTaskErrorMessages';
import { isUuid } from '@/features/care-tasks/utils/uuid';
import { colors, spacing } from '@/theme';

export default function CareTaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = typeof id === 'string' && isUuid(id) ? id : '';
  const { canEditAnimal: canWrite } = useCapabilities();
  const taskQuery = useCareTask(taskId);
  const animalsQuery = useCareTaskAnimals();
  const completeTask = useCompleteCareTask();
  const cancelTask = useCancelCareTask();

  const task = taskQuery.data;
  const animalName = animalsQuery.data?.find((animal) => animal.id === task?.animalId)?.name;
  const isBusy = completeTask.isPending || cancelTask.isPending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver a la lista de tareas"
        fallbackHref="/care-tasks"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="heading1">Detalle de la tarea</AppText>

        {taskId === '' ? (
          <EmptyState
            actionLabel="Volver"
            message="La tarea solicitada no es válida."
            onAction={() => navigateBack('/care-tasks')}
            title="Tarea no encontrada"
          />
        ) : null}

        {taskId !== '' && (taskQuery.isPending || animalsQuery.isPending) ? (
          <LoadingState label="Cargando tarea" />
        ) : null}

        {taskId !== '' && (taskQuery.isError || animalsQuery.isError) ? (
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos cargar la tarea. Puede que ya no exista."
            onAction={() => {
              void taskQuery.refetch();
              void animalsQuery.refetch();
            }}
            title="No se pudo cargar"
          />
        ) : null}

        {task && animalName ? (
          <>
            <CareTaskCard
              animalName={animalName}
              canWrite={canWrite}
              isBusy={isBusy}
              onCancel={(value) => cancelTask.mutate(value)}
              onComplete={(value) => completeTask.mutate(value)}
              onEdit={(value) =>
                router.push({ pathname: '/care-tasks/[id]/edit', params: { id: value } })
              }
              task={task}
            />
            {completeTask.isError || cancelTask.isError ? (
              <AppText color="danger" variant="caption">
                {toCareTaskErrorMessage(completeTask.error ?? cancelTask.error)}
              </AppText>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
