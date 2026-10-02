import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge, AppCard, AppIcon, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import type { AuditLog } from '../types';
import { auditActionLabel, formatAuditDate } from '../utils/auditPresentation';

export const AuditLogCard = memo(function AuditLogCard({ entry }: { entry: AuditLog }) {
  return (
    <Pressable
      accessibilityLabel={`${auditActionLabel(entry.action)}, ${formatAuditDate(entry.occurredAt)}`}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/audit/[id]', params: { id: entry.id } })}
    >
      <AppCard style={styles.card} variant="outlined">
        <View style={styles.heading}>
          <AppBadge
            label={auditActionLabel(entry.action)}
            tone={entry.action === 'access.denied' ? 'danger' : 'info'}
          />
          <AppIcon name="chevronRight" />
        </View>
        <AppText color="textSecondary">{entry.resourceType}</AppText>
        <AppText variant="label">{formatAuditDate(entry.occurredAt)}</AppText>
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
