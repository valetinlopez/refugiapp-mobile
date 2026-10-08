import { type Href } from 'expo-router';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  EmptyState,
  ErrorState,
  FeedbackState,
  LoadingState,
  OfflineState,
} from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { DecorativeBackground, ScreenHeader } from '@/components/patterns';
import { AppText } from '@/components/primitives';
import { useConnectivityStatus } from '@/core/network';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

import { useCareTaskAnimals } from '../hooks/useCareTaskAnimals';
import { useCreateCareTask } from '../hooks/useCreateCareTask';
import type { CreateCareTaskRequest } from '../types';
import { toCareTaskErrorMessage } from '../utils/careTaskErrorMessages';
import { CareTaskForm } from './CareTaskForm';

export interface CreateCareTaskScreenProps {
  initialAnimalId?: string | undefined;
}

export function CreateCareTaskScreen({ initialAnimalId }: CreateCareTaskScreenProps) {
  const { canEditAnimal: canWrite } = useCapabilities();
  const isOnline = useConnectivityStatus();
  const fallbackHref: Href = initialAnimalId
    ? { pathname: '/animals/[id]', params: { id: initialAnimalId, tab: 'tasks' } }
    : '/care-tasks';
  const animalsQuery = useCareTaskAnimals(initialAnimalId);
  const createTask = useCreateCareTask();

  if (!canWrite) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <DecorativeBackground variant="texture" />
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

  const hasAnimals = animalsQuery.data !== undefined && animalsQuery.data.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground variant="texture" />
      <AccountHeaderRow
        accessibilityHint="Volver a la lista de tareas"
        fallbackHref={fallbackHref}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText color="textSecondary" variant="label">
          Cuidados
        </AppText>
        <ScreenHeader
          title="Nueva tarea"
          subtitle="Organizá el próximo cuidado"
          titleVariant="display"
        />

        {animalsQuery.isPending && animalsQuery.data === undefined ? (
          <LoadingState label="Cargando animales" />
        ) : null}
        {animalsQuery.isError ? (
          isOnline ? (
            <ErrorState
              actionLabel="Reintentar"
              message={animalsQuery.errorMessage ?? 'No pudimos cargar los animales.'}
              onAction={() => void animalsQuery.refetch()}
              title="No se pudo preparar el formulario"
            />
          ) : (
            <OfflineState
              actionLabel="Reintentar"
              message="Conectate a internet para cargar los animales y crear la tarea."
              onAction={() => void animalsQuery.refetch()}
              testID="new-care-task-offline"
              title="Sin conexión"
            />
          )
        ) : null}
        {animalsQuery.isFallback ? (
          <FeedbackState
            icon="info"
            message="Se muestra solo el animal seleccionado; el listado completo no pudo cargarse."
            title="Listado de animales incompleto"
            tone="info"
          />
        ) : null}
        {!animalsQuery.isPending && !animalsQuery.isError && !hasAnimals ? (
          <EmptyState
            actionLabel="Actualizar"
            message="Necesitás al menos un animal registrado para crear una tarea de cuidado."
            onAction={() => void animalsQuery.refetch()}
            title="No hay animales disponibles"
          />
        ) : null}
        {hasAnimals ? (
          <CareTaskForm
            animalOptions={animalsQuery.data ?? []}
            errorMessage={createTask.error ? toCareTaskErrorMessage(createTask.error) : null}
            initialAnimalId={initialAnimalId}
            isSubmitting={createTask.isPending}
            mode="create"
            onCancel={() => navigateBack(fallbackHref)}
            onSubmit={(data: CreateCareTaskRequest) =>
              createTask.mutate(data, {
                onSuccess: (task) => {
                  AccessibilityInfo.announceForAccessibility(
                    'Tarea ' + task.title + ' creada como Pendiente.'
                  );
                  navigateBack(fallbackHref);
                },
              })
            }
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg, paddingBottom: spacing['3xl'] },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
