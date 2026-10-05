import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { resolveActorLabel } from '@/components/patterns';
import { AppAvatar, AppBadge, AppCard, AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { colors, spacing } from '@/theme';

import { useAuditLog } from '../hooks/useAuditLogs';
import type { AuditLogView } from '../types';
import {
  auditActionLabel,
  auditActionTone,
  auditResourceTypeLabel,
  formatAuditDateBoth,
  sanitizeAuditMetadata,
  toAuditErrorMessage,
} from '../utils/auditPresentation';

const SYSTEM_ACTOR_LABEL = 'Sistema';

export function AuditLogDetail({ id }: { id: string }) {
  const query = useAuditLog(id);
  if (!id)
    return (
      <EmptyState
        message="El identificador del evento no es válido."
        title="Evento no disponible"
      />
    );
  if (query.isPending) return <LoadingState label="Cargando detalle de auditoría" />;
  if (query.isError) {
    if (isNetworkError(query.error)) {
      return (
        <OfflineState
          actionLabel={offlineCopy.actionLabel}
          message={offlineCopy.message}
          onAction={() => void query.refetch()}
          testID={OFFLINE_STATE_TEST_ID}
          title={offlineCopy.title}
        />
      );
    }
    return (
      <ErrorState
        actionLabel="Reintentar"
        message={toAuditErrorMessage(query.error)}
        onAction={() => void query.refetch()}
        title="No se pudo cargar el evento"
      />
    );
  }

  const entry = query.data;
  const metadata = JSON.stringify(sanitizeAuditMetadata(entry.metadata), null, 2);
  return (
    <ScrollView contentContainerStyle={styles.content} testID="audit-detail">
      <AppText variant="heading1">Detalle de auditoría</AppText>
      <AppBadge label={auditActionLabel(entry.action)} tone={auditActionTone(entry.action)} />
      <AppCard style={styles.card} variant="outlined">
        <Detail label="Actor" value={<ActorDetail entry={entry} />} />
        <Detail label="Acción" value={auditActionLabel(entry.action)} />
        <Detail label="Recurso" value={auditResourceTypeLabel(entry.resourceType)} />
        <Detail label="ID del recurso" value={entry.resourceId ?? 'Sin identificador'} />
        <Detail label="Fecha" value={formatAuditDateBoth(entry.occurredAt)} />
      </AppCard>
      <View style={styles.metadata}>
        <AppText variant="heading3">Información adicional</AppText>
        <AppText>{metadata === '{}' ? 'Sin información adicional' : metadata}</AppText>
      </View>
    </ScrollView>
  );
}

function ActorDetail({ entry }: { entry: AuditLogView }) {
  const actorLabel = resolveActorLabel(
    entry.actor?.displayName,
    entry.actorFallbackId,
    SYSTEM_ACTOR_LABEL
  );
  return (
    <View style={styles.actorDetail}>
      <AppAvatar
        accessibilityLabel={`Actor: ${actorLabel}`}
        initials={entry.actor?.initials ?? '?'}
        size="sm"
      />
      <View style={styles.actorText}>
        <AppText style={styles.actorName}>{actorLabel}</AppText>
        {entry.actor ? (
          <AppText color="textSecondary" variant="caption">
            {entry.actor.email}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <View style={styles.row}>
      <AppText color="textSecondary" variant="label">
        {label}
      </AppText>
      <View style={styles.value}>
        {typeof value === 'string' ? <AppText>{value}</AppText> : value}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actorDetail: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actorName: { flexShrink: 1 },
  actorText: { alignItems: 'flex-end', gap: spacing.xxs, minWidth: 0 },
  card: { gap: spacing.md },
  content: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  metadata: { gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  value: { flexShrink: 1, minWidth: 0 },
});
