import { useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AppText } from '@/components/primitives';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { VeterinarianForm } from '@/features/veterinarians/components/VeterinarianForm';
import { useVeterinarian } from '@/features/veterinarians/hooks/useVeterinarian';
import { useUpdateVeterinarian } from '@/features/veterinarians/hooks/useVeterinarianMutations';
import {
  hasVeterinarianPatchChanges,
  toUpdateVeterinarianRequest,
  toVeterinarianFormValues,
} from '@/features/veterinarians/utils/veterinarianMappers';
import { toVeterinarianErrorMessage } from '@/features/veterinarians/utils/veterinarianPresentation';
import { isUuid } from '@/core/validation';
import { colors, spacing } from '@/theme';

export default function EditVeterinarianRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canManageVets } = useCapabilities();

  const veterinarianId = typeof id === 'string' && isUuid(id) ? id : '';
  const fallbackHref: Href = veterinarianId
    ? { pathname: '/veterinarians/[id]', params: { id: veterinarianId } }
    : '/veterinarians';
  const veterinarianQuery = useVeterinarian(veterinarianId);
  const updateVeterinarian = useUpdateVeterinarian();

  if (!canManageVets) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow
          accessibilityHint="Volver al detalle del veterinario"
          fallbackHref={fallbackHref}
        />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Solo los encargados y administradores pueden editar veterinarios."
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
        accessibilityHint="Volver al detalle del veterinario"
        fallbackHref={fallbackHref}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Editar veterinario</AppText>
        <EditForm
          errorMessage={
            updateVeterinarian.error ? toVeterinarianErrorMessage(updateVeterinarian.error) : null
          }
          isSubmitting={updateVeterinarian.isPending}
          onBack={() => navigateBack(fallbackHref)}
          onRetry={() => void veterinarianQuery.refetch()}
          onSubmit={(values) => {
            const original = veterinarianQuery.data;
            if (original === undefined) return;
            const patch = toUpdateVeterinarianRequest(values, original);
            if (!hasVeterinarianPatchChanges(patch)) {
              navigateBack(fallbackHref);
              return;
            }
            updateVeterinarian.mutate(
              { id: veterinarianId, input: patch },
              { onSuccess: () => navigateBack(fallbackHref) }
            );
          }}
          query={veterinarianQuery}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface EditFormProps {
  errorMessage: string | null;
  isSubmitting: boolean;
  onBack(): void;
  onRetry(): void;
  onSubmit(values: ReturnType<typeof toVeterinarianFormValues>): void;
  query: ReturnType<typeof useVeterinarian>;
}

function EditForm({ errorMessage, isSubmitting, onBack, onRetry, onSubmit, query }: EditFormProps) {
  if (query.isPending) {
    return <LoadingState label="Cargando veterinario" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        actionLabel="Reintentar"
        message={toVeterinarianErrorMessage(query.error)}
        onAction={onRetry}
        title="No se pudo cargar el veterinario"
      />
    );
  }

  if (query.data === undefined) {
    return (
      <EmptyState
        actionLabel="Volver"
        message="El veterinario que querés editar ya no está disponible."
        onAction={onBack}
        title="Veterinario no encontrado"
      />
    );
  }

  return (
    <VeterinarianForm
      errorMessage={errorMessage}
      initialValues={toVeterinarianFormValues(query.data)}
      isSubmitting={isSubmitting}
      mode="edit"
      onSubmit={onSubmit}
      submitLabel="Guardar cambios"
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
