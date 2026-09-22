import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { CareTaskForm } from '@/features/care-tasks/components/CareTaskForm';
import { useCareTaskAnimals } from '@/features/care-tasks/hooks/useCareTaskAnimals';
import { useCreateCareTask } from '@/features/care-tasks/hooks/useCreateCareTask';
import type { CreateCareTaskRequest } from '@/features/care-tasks/types';
import { toCareTaskErrorMessage } from '@/features/care-tasks/utils/careTaskErrorMessages';
import { isUuid } from '@/features/care-tasks/utils/uuid';
import { useSession } from '@/features/auth/session';
import { colors, spacing } from '@/theme';

export default function CreateCareTaskScreen() {
  const { animalId } = useLocalSearchParams<{ animalId?: string }>();
  const { user } = useSession();
  const canWrite =
    user?.roles.some((role) => role === 'admin' || role === 'shelter_manager') ?? false;
  const initialAnimalId = typeof animalId === 'string' && isUuid(animalId) ? animalId : undefined;
  const animalsQuery = useCareTaskAnimals();
  const createTask = useCreateCareTask();

  if (!canWrite) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Tu rol permite consultar tareas, pero no crearlas."
            onAction={goBack}
            title="Sin permiso"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Crear tarea</AppText>
        <AppText color="textSecondary">
          La tarea quedará pendiente y el backend registrará tu usuario como creador.
        </AppText>
        {animalsQuery.isPending ? <LoadingState label="Cargando animales" /> : null}
        {animalsQuery.isError ? (
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos cargar los animales."
            onAction={() => void animalsQuery.refetch()}
            title="No se pudo preparar el formulario"
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
              createTask.mutate(data, { onSuccess: goBack })
            }
            responsibleLabel={user?.email ?? 'Usuario autenticado'}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function goBack(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/care-tasks');
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
