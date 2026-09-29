import { useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { navigateBack } from '@/components/navigation';
import { EmptyState, ErrorState, FeedbackState, LoadingState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { isUuid } from '@/core/validation';
import { CareTaskForm } from '@/features/care-tasks/components/CareTaskForm';
import { useCareTaskAnimals } from '@/features/care-tasks/hooks/useCareTaskAnimals';
import { useCreateCareTask } from '@/features/care-tasks/hooks/useCreateCareTask';
import type { CreateCareTaskRequest } from '@/features/care-tasks/types';
import { toCareTaskErrorMessage } from '@/features/care-tasks/utils/careTaskErrorMessages';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { useSession } from '@/features/auth/session';
import { colors, spacing } from '@/theme';

export default function CreateCareTaskScreen() {
  const { animalId } = useLocalSearchParams<{ animalId?: string }>();
  const { user } = useSession();
  const { canEditAnimal: canWrite } = useCapabilities();
  const initialAnimalId = typeof animalId === 'string' && isUuid(animalId) ? animalId : undefined;
  const fallbackHref: Href = initialAnimalId
    ? { pathname: '/animals/[id]', params: { id: initialAnimalId, tab: 'tasks' } }
    : '/care-tasks';
  const animalsQuery = useCareTaskAnimals(initialAnimalId);
  const createTask = useCreateCareTask();

  if (!canWrite) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow
          accessibilityHint="Volver a la lista de tareas"
          fallbackHref={fallbackHref}
        />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Tu rol permite consultar tareas, pero no crearlas."
            onAction={() => navigateBack(fallbackHref)}
            title="Sin permiso"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver a la lista de tareas"
        fallbackHref={fallbackHref}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Crear tarea</AppText>
        <AppText color="textSecondary">
          La tarea quedará pendiente y el backend registrará tu usuario como creador.
        </AppText>
        {animalsQuery.isPending && animalsQuery.data === undefined ? (
          <LoadingState label="Cargando animales" />
        ) : null}
        {animalsQuery.isError ? (
          <ErrorState
            actionLabel="Reintentar"
            message={animalsQuery.errorMessage ?? 'No pudimos cargar los animales.'}
            onAction={() => void animalsQuery.refetch()}
            title="No se pudo preparar el formulario"
          />
        ) : null}
        {animalsQuery.isFallback ? (
          <FeedbackState
            icon="info"
            message="Se muestra solo el animal seleccionado; el listado completo no pudo cargarse."
            title="Listado de animales incompleto"
            tone="info"
          />
        ) : null}
        {animalsQuery.data ? (
          <CareTaskForm
            animalOptions={animalsQuery.data}
            errorMessage={createTask.error ? toCareTaskErrorMessage(createTask.error) : null}
            initialAnimalId={initialAnimalId}
            isSubmitting={createTask.isPending}
            mode="create"
            onSubmit={(data: CreateCareTaskRequest) =>
              createTask.mutate(data, { onSuccess: () => navigateBack(fallbackHref) })
            }
            responsibleLabel={user?.email ?? 'Usuario autenticado'}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
