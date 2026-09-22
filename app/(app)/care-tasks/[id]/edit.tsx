import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { useSession } from '@/features/auth/session';
import { CareTaskForm } from '@/features/care-tasks/components/CareTaskForm';
import { useCareTask } from '@/features/care-tasks/hooks/useCareTask';
import { useCareTaskAnimals } from '@/features/care-tasks/hooks/useCareTaskAnimals';
import { useUpdateCareTask } from '@/features/care-tasks/hooks/useUpdateCareTask';
import { toCareTaskErrorMessage } from '@/features/care-tasks/utils/careTaskErrorMessages';
import { isUuid } from '@/features/care-tasks/utils/uuid';
import { colors, spacing } from '@/theme';

export default function EditCareTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const canWrite =
    user?.roles.some((role) => role === 'admin' || role === 'shelter_manager') ?? false;
  const taskId = typeof id === 'string' && isUuid(id) ? id : '';
  const taskQuery = useCareTask(taskId);
  const animalsQuery = useCareTaskAnimals();
  const updateTask = useUpdateCareTask(taskId);

  if (!canWrite) {
    return <Denied />;
  }

  const task = taskQuery.data;
  const animalName = animalsQuery.data?.find((animal) => animal.id === task?.animalId)?.name;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Editar tarea</AppText>
        {taskQuery.isPending || animalsQuery.isPending ? (
          <LoadingState label="Cargando tarea" />
        ) : null}
        {taskQuery.isError || animalsQuery.isError ? (
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos cargar la tarea."
            onAction={() => {
              void taskQuery.refetch();
              void animalsQuery.refetch();
            }}
            title="No se pudo editar"
          />
        ) : null}
        {task && animalName ? (
          task.status === 'pending' ? (
            <CareTaskForm
              animalName={animalName}
              errorMessage={updateTask.error ? toCareTaskErrorMessage(updateTask.error) : null}
              isSubmitting={updateTask.isPending}
              mode="edit"
              onSubmit={(data) => updateTask.mutate(data, { onSuccess: goBack })}
              responsibleLabel={user?.email ?? 'Usuario autenticado'}
              task={task}
            />
          ) : (
            <EmptyState
              actionLabel="Volver"
              message="Solo las tareas pendientes pueden editarse."
              onAction={goBack}
              title="Tarea cerrada"
            />
          )
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Denied() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centered}>
        <EmptyState
          actionLabel="Volver"
          message="Tu rol permite consultar tareas, pero no editarlas."
          onAction={goBack}
          title="Sin permiso"
        />
      </View>
    </SafeAreaView>
  );
}

function goBack(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/inbox');
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
