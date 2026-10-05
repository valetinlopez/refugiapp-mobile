import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ActorRow, resolveActorLabel } from '@/components/patterns';
import { AppBadge, AppCard, AppIcon, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import type { AuditLogView } from '../types';
import {
  auditActionLabel,
  auditActionTone,
  auditResourceTypeLabel,
  formatAuditDate,
} from '../utils/auditPresentation';

const SYSTEM_ACTOR_LABEL = 'Sistema';

export const AuditLogCard = memo(function AuditLogCard({ entry }: { entry: AuditLogView }) {
  const actorLabel = resolveActorLabel(
    entry.actor?.displayName,
    entry.actorFallbackId,
    SYSTEM_ACTOR_LABEL
  );
  return (
    <Pressable
      accessibilityLabel={`${auditActionLabel(entry.action)}, ${auditResourceTypeLabel(entry.resourceType)}, ${actorLabel}, ${formatAuditDate(entry.occurredAt)}`}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/audit/[id]', params: { id: entry.id } })}
      testID="audit-card"
    >
      <AppCard style={styles.card} variant="outlined">
        <View style={styles.heading}>
          <AppBadge label={auditActionLabel(entry.action)} tone={auditActionTone(entry.action)} />
          <AppIcon name="chevronRight" />
        </View>
        <AppText color="textSecondary">{auditResourceTypeLabel(entry.resourceType)}</AppText>
        <ActorRow
          accessibilityLabel={`Actor: ${actorLabel}`}
          initials={entry.actor?.initials ?? '?'}
          name={actorLabel}
          occurredAt={entry.occurredAt}
        />
      </AppCard>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
});
