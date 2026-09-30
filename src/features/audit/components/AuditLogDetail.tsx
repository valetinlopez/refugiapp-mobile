import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppBadge, AppCard, AppText } from '@/components/primitives';
import { colors, spacing } from '@/theme';

import { useAuditLog } from '../hooks/useAuditLogs';
import {
  auditActionLabel,
  formatAuditDate,
  sanitizeAuditMetadata,
  toAuditErrorMessage,
} from '../utils/auditPresentation';

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
  if (query.isError)
    return (
      <ErrorState
        actionLabel="Reintentar"
        message={toAuditErrorMessage(query.error)}
        onAction={() => void query.refetch()}
        title="No se pudo cargar el evento"
      />
    );

  const entry = query.data;
  const metadata = JSON.stringify(sanitizeAuditMetadata(entry.metadata), null, 2);
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <AppText variant="heading1">Detalle de auditoría</AppText>
      <AppBadge
        label={auditActionLabel(entry.action)}
        tone={entry.action === 'access.denied' ? 'danger' : 'info'}
      />
      <AppCard style={styles.card} variant="outlined">
        <Detail label="Actor" value={entry.actorUserId ?? 'Sistema'} />
        <Detail label="Acción" value={entry.action} />
        <Detail label="Recurso" value={entry.resourceType} />
        <Detail label="ID del recurso" value={entry.resourceId ?? 'Sin identificador'} />
        <Detail label="Fecha" value={formatAuditDate(entry.occurredAt)} />
      </AppCard>
      <View style={styles.metadata}>
        <AppText variant="heading3">Información adicional</AppText>
        <AppText>{metadata === '{}' ? 'Sin información adicional' : metadata}</AppText>
      </View>
    </ScrollView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText color="textSecondary" variant="label">
        {label}
      </AppText>
      <AppText style={styles.value}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
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
  value: { flexShrink: 1, textAlign: 'right' },
});
