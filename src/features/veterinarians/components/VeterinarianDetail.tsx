import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { SectionHeader } from '@/components/patterns';
import {
  AppAvatar,
  AppBadge,
  AppButton,
  AppCard,
  AppDivider,
  AppIcon,
  AppText,
  type AppIconName,
} from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { colors, radii, sizes, spacing } from '@/theme';

import type { VeterinarianResponse } from '../types';
import {
  formatVeterinarianUserRoles,
  toVeterinarianErrorMessage,
  veterinarianFullName,
  veterinarianInitials,
  veterinarianLinkedUserName,
} from '../utils/veterinarianPresentation';
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
  const name = veterinarianFullName(veterinarian);
  const linkedUser = veterinarian.user;

  return (
    <View style={styles.detail} testID="veterinarian-detail">
      <AppText accessibilityRole="header" variant="display">
        Perfil veterinario
      </AppText>

      <AppCard
        accessibilityLabel={`${name}, matrícula ${veterinarian.licenseNumber}, ${veterinarian.isActive ? 'Activo' : 'Inactivo'}`}
        accessibilityRole="summary"
        style={styles.identityCard}
        testID="veterinarian-identity-card"
        variant="elevated"
      >
        <AppAvatar
          accessibilityLabel={`Avatar de ${name}`}
          initials={veterinarianInitials(veterinarian)}
          size="xl"
        />
        <View style={styles.identityCopy}>
          <AppText variant="heading2">{name}</AppText>
          <AppText color="textSecondary">Matrícula {veterinarian.licenseNumber}</AppText>
          <AppBadge
            icon={veterinarian.isActive ? 'check' : 'close'}
            label={veterinarian.isActive ? 'Activo' : 'Inactivo'}
            tone={veterinarian.isActive ? 'positive' : 'neutral'}
          />
        </View>
      </AppCard>

      <DetailSection title="Datos de contacto">
        <AppCard accessibilityLabel="Datos de contacto" variant="elevated">
          <DetailRow
            icon="mail"
            label="Correo electrónico"
            value={veterinarian.email ?? 'No informado'}
          />
          <AppDivider />
          <DetailRow icon="phone" label="Teléfono" value={veterinarian.phone ?? 'No informado'} />
        </AppCard>
      </DetailSection>

      <DetailSection title="Información profesional">
        <AppCard accessibilityLabel="Información profesional" variant="elevated">
          <DetailRow icon="document" label="Matrícula" value={veterinarian.licenseNumber} />
          <AppDivider />
          <DetailRow icon="document" label="Notas" value={veterinarian.notes ?? 'Sin notas'} />
        </AppCard>
      </DetailSection>

      <DetailSection title="Usuario interno">
        <AppCard
          accessibilityLabel={
            linkedUser
              ? `${veterinarianLinkedUserName(linkedUser)}, ${linkedUser.email}, cuenta ${linkedUser.isActive ? 'activa' : 'inactiva'}, rol ${formatVeterinarianUserRoles(linkedUser.roles)}`
              : 'Sin acceso vinculado'
          }
          accessibilityRole="summary"
          style={styles.userCard}
          testID="veterinarian-user-card"
          variant="elevated"
        >
          <View style={styles.iconFrame}>
            <AppIcon color="info" name="account" size={sizes.iconLg} />
          </View>
          {linkedUser ? (
            <View style={styles.userCopy}>
              <AppText variant="bodyStrong">{veterinarianLinkedUserName(linkedUser)}</AppText>
              <AppText color="textSecondary">{linkedUser.email}</AppText>
              <AppText color="textSecondary" variant="caption">
                {formatVeterinarianUserRoles(linkedUser.roles)}
              </AppText>
              <AppBadge
                icon={linkedUser.isActive ? 'check' : 'close'}
                label={linkedUser.isActive ? 'Cuenta activa' : 'Cuenta inactiva'}
                tone={linkedUser.isActive ? 'positive' : 'neutral'}
              />
            </View>
          ) : (
            <View style={styles.userCopy}>
              <AppText variant="bodyStrong">Sin acceso vinculado</AppText>
              <AppText color="textSecondary">
                Este perfil profesional no tiene un usuario interno asociado.
              </AppText>
            </View>
          )}
        </AppCard>
      </DetailSection>

      {canWrite ? (
        <View style={styles.actions}>
          <AppButton label="Editar perfil" onPress={onEdit} />
          {veterinarian.isActive ? (
            <AppButton
              accessibilityHint="Solicita confirmación antes de desactivar el perfil."
              accessibilityLabel="Desactivar veterinario"
              label="Desactivar"
              onPress={onRequestDeactivate}
              variant="secondary"
            />
          ) : (
            <AppButton
              accessibilityHint="Confirma la reactivación para que el veterinario vuelva a estar disponible."
              accessibilityLabel="Reactivar veterinario"
              label="Reactivar"
              onPress={onRequestReactivate}
              variant="primary"
            />
          )}
          <AppText color="textSecondary" style={styles.historyNotice} variant="caption">
            {veterinarian.isActive
              ? 'Al desactivar se conserva todo el historial clínico asociado.'
              : 'El historial clínico asociado se conserva mientras el perfil está inactivo.'}
          </AppText>
        </View>
      ) : (
        <AppCard variant="outlined">
          <AppText color="textSecondary">
            Tu rol permite consultar veterinarios, pero no editarlos ni cambiar su estado.
          </AppText>
        </AppCard>
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

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      {children}
    </View>
  );
}

interface DetailRowProps extends ViewProps {
  icon: AppIconName;
  label: string;
  value: string;
}

function DetailRow({ icon, label, style, value, ...props }: DetailRowProps) {
  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      accessibilityRole="summary"
      style={[styles.detailRow, style]}
      {...props}
    >
      <View style={styles.iconFrame}>
        <AppIcon color="info" name={icon} size={sizes.iconLg} />
      </View>
      <View style={styles.rowCopy}>
        <AppText color="textSecondary" variant="label">
          {label}
        </AppText>
        <AppText variant="bodyStrong">{value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.md },
  detail: { gap: spacing.lg },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    paddingVertical: spacing.sm,
  },
  historyNotice: { textAlign: 'center' },
  iconFrame: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.full,
    flexShrink: 0,
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
  identityCard: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  identityCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: sizes.avatarXl,
  },
  rowCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  section: { gap: spacing.sm },
  userCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  userCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
});
