import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import {
  ActorRow,
  DecorativeBackground,
  MetadataRow,
  resolveActorLabel,
  ScreenHeader,
  SectionHeader,
} from '@/components/patterns';
import { AppBadge, AppCard, AppIcon, AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { colors, opacity, radii, sizes, spacing } from '@/theme';

import { useAuditLog } from '../hooks/useAuditLogs';
import { useCopyAuditText } from '../hooks/useCopyAuditText';
import type { AuditLogView } from '../types';
import {
  auditActionLabel,
  auditCopyAnnouncement,
  auditResourceIcon,
  auditResourceTypeLabel,
  buildAuditMetadataRows,
  formatAuditDateBoth,
  formatAuditMetadataJson,
  isHighRiskAuditAction,
  sanitizeAuditMetadata,
  toAuditErrorMessage,
} from '../utils/auditPresentation';
import { AuditCopyButton } from './AuditCopyButton';

const SYSTEM_ACTOR_LABEL = 'Sistema';
const ACTOR_ID_KEY = 'actor-id';
const RESOURCE_ID_KEY = 'resource-id';

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

  return <AuditLogDetailContent entry={query.data} />;
}

function AuditLogDetailContent({ entry }: { entry: AuditLogView }) {
  const { copiedKey, errorKey, copy } = useCopyAuditText();
  const metadata = useMemo(() => sanitizeAuditMetadata(entry.metadata), [entry.metadata]);
  const metadataRows = useMemo(() => buildAuditMetadataRows(metadata), [metadata]);
  const metadataJson = useMemo(() => formatAuditMetadataJson(metadata), [metadata]);
  const actionLabel = auditActionLabel(entry.action);
  const isHighRisk = isHighRiskAuditAction(entry.action);
  const actorId = entry.actor?.id ?? entry.actorFallbackId;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      testID="audit-detail"
    >
      <DecorativeBackground variant="texture" />
      <AppText color="textSecondary" variant="label">
        Auditoría
      </AppText>
      <ScreenHeader
        subtitle="Registro de actividad del sistema"
        title="Detalle de auditoría"
        titleVariant="display"
      />
      <AppBadge icon="info" label="Solo administradores" />

      <AuditEventHero actionLabel={actionLabel} entry={entry} isHighRisk={isHighRisk} />

      <AppCard style={styles.card} variant="outlined">
        <SectionHeader title="Información del evento" />
        <MetadataRow label="Acción" value={actionLabel} />
        <MetadataRow label="Fecha y hora" value={formatAuditDateBoth(entry.occurredAt)} />
        <MetadataRow label="Tipo de recurso" value={auditResourceTypeLabel(entry.resourceType)} />
        {entry.resourceId ? (
          <IdentifierRow
            copied={copiedKey === RESOURCE_ID_KEY}
            errored={errorKey === RESOURCE_ID_KEY}
            label="UUID del recurso"
            onCopy={() =>
              copy(
                entry.resourceId ?? '',
                auditCopyAnnouncement('Identificador del recurso'),
                RESOURCE_ID_KEY
              )
            }
            testID="audit-copy-resource-id"
            value={entry.resourceId}
          />
        ) : (
          <MetadataRow label="UUID del recurso" value="Sin identificador" />
        )}
        {actorId ? (
          <IdentifierRow
            copied={copiedKey === ACTOR_ID_KEY}
            errored={errorKey === ACTOR_ID_KEY}
            label="UUID del actor"
            onCopy={() =>
              copy(actorId, auditCopyAnnouncement('Identificador del actor'), ACTOR_ID_KEY)
            }
            testID="audit-copy-actor-id"
            value={actorId}
          />
        ) : (
          <MetadataRow label="UUID del actor" value="Sin identificador" />
        )}
        <View style={styles.actor}>
          <AppText color="textSecondary" variant="label">
            Actor
          </AppText>
          <ActorRow
            accessibilityLabel={`Actor: ${resolveActorLabel(
              entry.actor?.displayName,
              entry.actorFallbackId,
              SYSTEM_ACTOR_LABEL
            )}`}
            {...(entry.actor ? { caption: entry.actor.email } : {})}
            initials={entry.actor?.initials ?? '?'}
            name={resolveActorLabel(
              entry.actor?.displayName,
              entry.actorFallbackId,
              SYSTEM_ACTOR_LABEL
            )}
          />
        </View>
      </AppCard>

      <AppCard style={styles.card} variant="outlined">
        <SectionHeader title="Metadatos" />
        {metadataRows.length === 0 ? (
          <AppText color="textSecondary">Sin información adicional</AppText>
        ) : (
          metadataRows.map((row) =>
            row.copyable ? (
              <IdentifierRow
                copied={copiedKey === `metadata:${row.key}`}
                errored={errorKey === `metadata:${row.key}`}
                key={row.key}
                label={row.label}
                onCopy={() =>
                  copy(row.value, auditCopyAnnouncement(row.label), `metadata:${row.key}`)
                }
                testID={`audit-copy-metadata-${row.key}`}
                value={row.value}
              />
            ) : (
              <MetadataRow key={row.key} label={row.label} value={row.value} />
            )
          )
        )}
        <MetadataJsonDisclosure json={metadataJson} />
      </AppCard>
    </ScrollView>
  );
}

function AuditEventHero({
  actionLabel,
  entry,
  isHighRisk,
}: {
  actionLabel: string;
  entry: AuditLogView;
  isHighRisk: boolean;
}) {
  return (
    <AppCard style={[styles.hero, isHighRisk && styles.heroRisk]} variant="outlined">
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.heroIcon, isHighRisk && styles.heroIconRisk]}
      >
        <AppIcon
          color={isHighRisk ? 'danger' : 'info'}
          name={auditResourceIcon(entry.resourceType)}
          size={sizes.iconLg}
        />
      </View>
      <View style={styles.heroCopy}>
        <AppText variant="heading2">{actionLabel}</AppText>
        <AppText color="textSecondary">{auditResourceTypeLabel(entry.resourceType)}</AppText>
        <AppText color="textSecondary" variant="caption">
          {formatAuditDateBoth(entry.occurredAt)}
        </AppText>
      </View>
      {isHighRisk ? <AppBadge icon="alert" label="Riesgo alto" tone="danger" /> : null}
    </AppCard>
  );
}

function IdentifierRow({
  copied,
  errored,
  label,
  onCopy,
  testID,
  value,
}: {
  copied: boolean;
  errored: boolean;
  label: string;
  onCopy: () => void;
  testID: string;
  value: string;
}) {
  const feedback = copied ? 'Copiado' : errored ? 'No se pudo copiar' : '';
  return (
    <View style={styles.identifierRow}>
      <View style={styles.identifierCopy}>
        <AppText color="textSecondary" variant="label">
          {label}
        </AppText>
        <AppText variant="bodyStrong">{value}</AppText>
        {feedback ? (
          <AppText
            accessibilityLiveRegion="polite"
            color={copied ? 'positive' : 'danger'}
            variant="caption"
          >
            {feedback}
          </AppText>
        ) : null}
      </View>
      <AuditCopyButton
        accessibilityLabel={`Copiar ${label}`}
        copied={copied}
        onPress={onCopy}
        testID={testID}
      />
    </View>
  );
}

function MetadataJsonDisclosure({ json }: { json: string }) {
  const [expanded, setExpanded] = useState(false);
  if (json === '') return null;
  return (
    <View style={styles.disclosure}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((previous) => !previous)}
        style={({ pressed }) => [styles.disclosureHeader, pressed && styles.pressed]}
        testID="audit-metadata-json-toggle"
      >
        <AppText variant="bodyStrong">
          {expanded ? 'Ocultar datos sanitizados' : 'Mostrar datos sanitizados'}
        </AppText>
        <AppIcon
          color="textSecondary"
          name="chevronRight"
          size={sizes.iconSm}
          style={expanded ? styles.chevronExpanded : undefined}
        />
      </Pressable>
      {expanded ? (
        <View style={styles.jsonBox}>
          <AppText color="textSecondary" variant="caption">
            {json}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actor: { gap: spacing.xxs },
  card: { gap: spacing.sm },
  chevronExpanded: { transform: [{ rotate: '90deg' }] },
  content: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  disclosure: { gap: spacing.xs, marginTop: spacing.xs },
  disclosureHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    minHeight: sizes.touchTarget,
  },
  hero: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  heroCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    height: sizes.avatarMd,
    justifyContent: 'center',
    width: sizes.avatarMd,
  },
  heroIconRisk: { borderColor: colors.danger },
  heroRisk: { borderColor: colors.danger, borderLeftWidth: spacing.xxs },
  identifierCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  identifierRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  jsonBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  pressed: { opacity: opacity.pressedSubtle },
});
