import { StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppBadge, AppButton, AppCard, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import type { VeterinarianResponse } from '../types';
import { toVeterinarianErrorMessage } from '../utils/veterinarianPresentation';
import { DeactivateVeterinarianDialog } from './DeactivateVeterinarianDialog';

export interface VeterinarianDetailQuery {
  data: VeterinarianResponse | undefined;
  error: unknown;
  isError: boolean;
  isPending: boolean;
  refetch(): void;
}

interface VeterinarianDetailProps {
  canWrite: boolean;
  confirmVisible: boolean;
  deactivateError: string | null;
  onBack(): void;
  onCancelDeactivate(): void;
  onConfirmDeactivate(): void;
  onEdit(): void;
  onRetry(): void;
  onRequestDeactivate(): void;
  query: VeterinarianDetailQuery;
  submittingDeactivate: boolean;
}

export function VeterinarianDetail({
  canWrite,
  confirmVisible,
  deactivateError,
  onBack,
  onCancelDeactivate,
  onConfirmDeactivate,
  onEdit,
  onRetry,
  onRequestDeactivate,
  query,
  submittingDeactivate,
}: VeterinarianDetailProps) {
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
        message="El veterinario que buscás ya no está disponible."
        onAction={onBack}
        title="Veterinario no encontrado"
      />
    );
  }

  const veterinarian = query.data;
  const name = `${veterinarian.firstName} ${veterinarian.lastName}`;

  return (
    <View style={styles.detail}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <AppText variant="heading1">{name}</AppText>
          <AppText color="textSecondary">Matrícula {veterinarian.licenseNumber}</AppText>
          <AppBadge
            label={veterinarian.isActive ? 'Activo' : 'Inactivo'}
            tone={veterinarian.isActive ? 'positive' : 'neutral'}
          />
        </View>
      </View>

      <AppCard accessibilityLabel="Datos del veterinario">
        <Field label="Email" value={veterinarian.email ?? 'No informado'} />
        <Field label="Teléfono" value={veterinarian.phone ?? 'No informado'} />
        <Field label="Usuario vinculado" value={veterinarian.userId ?? 'No vinculado'} />
        <Field label="Notas" value={veterinarian.notes ?? 'Sin notas'} />
      </AppCard>

      {canWrite ? (
        <View style={styles.actions}>
          <AppButton icon="refresh" label="Editar" onPress={onEdit} variant="secondary" />
          {veterinarian.isActive ? (
            <AppButton
              accessibilityLabel="Desactivar veterinario"
              label="Desactivar"
              onPress={onRequestDeactivate}
              variant="danger"
            />
          ) : (
            <View style={styles.reactivate}>
              <AppButton
                accessibilityHint="La reactivación está pendiente de soporte del backend."
                disabled
                label="Reactivar"
                variant="secondary"
              />
              <AppText color="textSecondary" variant="caption">
                La reactivación estará disponible cuando el backend la soporte.
              </AppText>
            </View>
          )}
        </View>
      ) : (
        <AppText color="textSecondary">
          Tu rol permite consultar veterinarios, pero no editarlos ni desactivarlos.
        </AppText>
      )}

      <DeactivateVeterinarianDialog
        errorMessage={deactivateError}
        name={name}
        onCancel={onCancelDeactivate}
        onConfirm={onConfirmDeactivate}
        submitting={submittingDeactivate}
        visible={confirmVisible}
      />
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <AppText color="textSecondary" variant="label">
        {label}
      </AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.md },
  detail: { gap: spacing.lg },
  field: { gap: spacing.xxs },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  heading: { flex: 1, gap: spacing.xxs },
  reactivate: { gap: spacing.xs },
});
