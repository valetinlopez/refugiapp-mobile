import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ActorRow, resolveActorLabel } from '@/components/patterns';
import { AppBadge, AppCard, AppIcon, AppText, type AppIconName } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

import type { AuditLogView, AuditResourceType } from '../types';
import {
  auditActionLabel,
  auditResourceTypeLabel,
  formatAuditDate,
  formatAuditIdentifier,
  isHighRiskAuditAction,
} from '../utils/auditPresentation';

const SYSTEM_ACTOR_LABEL = 'Sistema';

const RESOURCE_ICONS: Record<AuditResourceType, AppIconName> = {
  user: 'account',
  medical_record: 'medical',
  expense: 'money',
  care_task: 'document',
  auth_session: 'logout',
  authorization: 'alert',
  notification: 'info',
  adopter: 'account',
  adoption_application: 'document',
  adoption: 'heart',
};

export const AuditLogCard = memo(function AuditLogCard({ entry }: { entry: AuditLogView }) {
  const actionLabel = auditActionLabel(entry.action);
  const resourceLabel = auditResourceTypeLabel(entry.resourceType);
  const actorLabel = resolveActorLabel(
    entry.actor?.displayName,
    entry.actorFallbackId,
    SYSTEM_ACTOR_LABEL
  );
  const isHighRisk = isHighRiskAuditAction(entry.action);
  const riskLabel = isHighRisk ? ', riesgo alto' : '';

  return (
    <Pressable
      accessibilityHint="Abre el detalle del evento"
      accessibilityLabel={`${actionLabel}, ${resourceLabel}, ${actorLabel}, ${formatAuditDate(entry.occurredAt)}${riskLabel}`}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/audit/[id]', params: { id: entry.id } })}
      testID="audit-card"
    >
      <AppCard style={[styles.card, isHighRisk && styles.highRiskCard]} variant="outlined">
        <View style={[styles.icon, isHighRisk && styles.highRiskIcon]}>
          <AppIcon
            color={isHighRisk ? 'danger' : 'info'}
            name={RESOURCE_ICONS[entry.resourceType]}
            size={sizes.iconLg}
          />
        </View>
        <View style={styles.content}>
          <View style={styles.heading}>
            <AppText numberOfLines={2} variant="heading3">
              {actionLabel}
            </AppText>
            {isHighRisk ? <AppBadge icon="alert" label="Riesgo alto" tone="danger" /> : null}
          </View>
          <AppText color="textSecondary">{resourceLabel}</AppText>
          <AppText color="textSecondary" variant="caption">
            Recurso: {formatAuditIdentifier(entry.resourceId)}
          </AppText>
          <ActorRow
            accessibilityLabel={`Actor: ${actorLabel}`}
            initials={entry.actor?.initials ?? '?'}
            name={actorLabel}
            occurredAt={entry.occurredAt}
          />
        </View>
        <AppIcon name="chevronRight" />
      </AppCard>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  content: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  heading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  highRiskCard: { borderColor: colors.danger, borderLeftWidth: spacing.xxs },
  highRiskIcon: { backgroundColor: colors.surfaceElevated, borderColor: colors.danger },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    height: sizes.avatarMd,
    justifyContent: 'center',
    width: sizes.avatarMd,
  },
});
