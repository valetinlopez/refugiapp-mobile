import { StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { AppBadge, AppButton, AppCard, AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { spacing } from '@/theme';

import type { VeterinarianResponse } from '../types';
import { toVeterinarianErrorMessage } from '../utils/veterinarianPresentation';
import { DeactivateVeterinarianDialog } from './DeactivateVeterinarianDialog';
import { ReactivateVeterinarianDialog } from './ReactivateVeterinarianDialog';

export interface VeterinarianDetailQuery {
  data: VeterinarianResponse | undefined;
  error: unknown;
  isError: boolean;
  isPending: boolean;
  refetch(): void;
}

interface VeterinarianDetailProps {
  canWrite: boolean;
  confirmReactivateVisible: boolean;
  confirmVisible: boolean;
  deactivateError: string | null;
  onBack(): void;
  onCancelDeactivate(): void;
  onCancelReactivate(): void;
  onConfirmDeactivate(): void;
  onConfirmReactivate(): void;
  onEdit(): void;
  onRequestDeactivate(): void;
  onRequestReactivate(): void;
  onRetry(): void;
  query: VeterinarianDetailQuery;
  reactivateError: string | null;
  submittingDeactivate: boolean;
  submittingReactivate: boolean;
}

export function VeterinarianDetail({
  canWrite,
  confirmReactivateVisible,
  confirmVisible,
  deactivateError,
  onBack,
  onCancelDeactivate,
  onCancelReactivate,
  onConfirmDeactivate,
  onConfirmReactivate,
  onEdit,
  onRequestDeactivate,
  onRequestReactivate,
  onRetry,
  query,
  reactivateError,
  submittingDeactivate,
  submittingReactivate,
}: VeterinarianDetailProps) {
  if (query.isPending) {
    return <LoadingState label="Cargando veterinario" />;
  }

  if (query.isError) {
    if (isNetworkError(query.error)) {
      return (
        <OfflineState
          actionLabel={offlineCopy.actionLabel}
          message={offlineCopy.message}
          onAction={onRetry}
          testID={OFFLINE_STATE_TEST_ID}
          title={offlineCopy.title}
        />
      );
    }
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
        <Field
          label="Usuario vinculado"
          value={veterinarian.user?.email ?? 'Sin acceso vinculado'}
        />
        {veterinarian.user ? (
          <Field label="Rol del usuario" value={formatUserRole(veterinarian.user.roles)} />
        ) : null}
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
            <AppButton
              accessibilityHint="Confirma la reactivación para que el veterinario vuelva a estar disponible."
              accessibilityLabel="Reactivar veterinario"
              label="Reactivar"
              onPress={onRequestReactivate}
              variant="secondary"
            />
          )}
        </View>
      ) : (
        <AppText color="textSecondary">
          Tu rol permite consultar veterinarios, pero no editarlos ni cambiar su estado.
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
      <ReactivateVeterinarianDialog
        errorMessage={reactivateError}
        name={name}
        onCancel={onCancelReactivate}
        onConfirm={onConfirmReactivate}
        submitting={submittingReactivate}
        visible={confirmReactivateVisible}
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

function formatUserRole(roles: readonly string[]): string {
  if (roles.length === 0) {
    return 'Sin rol';
  }
  return roles
    .map((role) => {
      if (role === 'veterinarian') return 'Veterinario';
      if (role === 'admin') return 'Administrador';
      if (role === 'shelter_manager') return 'Encargado de refugio';
      return role;
    })
    .join(', ');
}

const styles = StyleSheet.create({
  actions: { gap: spacing.md },
  detail: { gap: spacing.lg },
  field: { gap: spacing.xxs },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  heading: { flex: 1, gap: spacing.xxs },
});
