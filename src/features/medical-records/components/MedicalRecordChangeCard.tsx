import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActorRow, resolveActorLabel } from '@/components/patterns';
import { AppBadge, AppCard, AppDivider, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import type { MedicalRecordChange } from '../types';
import {
  changeFieldsSummary,
  formatChangeDate,
  formatChangeValue,
  getChangeFieldLabel,
  getChangeTypeLabel,
  getChangeTypeTone,
} from '../utils/medicalRecordChangePresentation';

const SYSTEM_ACTOR_LABEL = 'Usuario del sistema';

export const MedicalRecordChangeCard = memo(function MedicalRecordChangeCard({
  change,
}: {
  change: MedicalRecordChange;
}) {
  const actorLabel = resolveActorLabel(
    change.changedBy?.displayName,
    change.changedByFallbackId,
    SYSTEM_ACTOR_LABEL
  );
  const badgeLabel = getChangeTypeLabel(change.changeType);
  const summary = changeFieldsSummary(change);

  return (
    <AppCard
      accessibilityLabel={`${badgeLabel}. ${actorLabel}. ${summary}. ${formatChangeDate(change.changedAt)}`}
      style={styles.card}
      testID="medical-record-change-card"
      variant="outlined"
    >
      <View style={styles.heading}>
        <AppBadge
          icon={change.changeType === 'soft_delete' ? 'close' : 'refresh'}
          label={badgeLabel}
          tone={getChangeTypeTone(change.changeType)}
        />
      </View>
      <ActorRow
        accessibilityLabel={`Actor: ${actorLabel}`}
        initials={change.changedBy?.initials ?? '?'}
        name={actorLabel}
        occurredAt={change.changedAt}
      />
      <AppText color="textSecondary" style={styles.summary} variant="label">
        {summary}
      </AppText>
      {change.changedFields.length > 0 ? (
        <>
          <AppDivider />
          <View style={styles.fields}>
            {change.changedFields.map((field) => (
              <View key={field} style={styles.fieldRow}>
                <AppText color="textSecondary" style={styles.fieldLabel} variant="label">
                  {getChangeFieldLabel(field)}
                </AppText>
                <AppText style={styles.fieldValue}>
                  {formatChangeValue(change.previousValues[field])}
                </AppText>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </AppCard>
  );
});

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  fieldLabel: { flexShrink: 0 },
  fieldRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  fieldValue: { flexShrink: 1, textAlign: 'right' },
  fields: { gap: spacing.xs },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  summary: { flexShrink: 1 },
});
