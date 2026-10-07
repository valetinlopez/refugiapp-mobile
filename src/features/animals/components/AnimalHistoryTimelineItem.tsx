import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

import type { AnimalHistoryEvent } from '../types';
import {
  formatAnimalEventDate,
  getAnimalEventTypeLabel,
  getAnimalEventVisual,
} from '../utils/animalHistoryPresentation';

interface AnimalHistoryTimelineItemProps {
  event: AnimalHistoryEvent;
  isFirst: boolean;
  isLast: boolean;
}

export const AnimalHistoryTimelineItem = memo(function AnimalHistoryTimelineItem({
  event,
  isFirst,
  isLast,
}: AnimalHistoryTimelineItemProps) {
  const label = getAnimalEventTypeLabel(event.eventType);
  const visual = getAnimalEventVisual(event.eventType);
  const date = formatAnimalEventDate(event.occurredAt);

  return (
    <View
      accessibilityLabel={`${label}. ${event.description}. ${date}`}
      accessibilityRole="summary"
      style={styles.row}
      testID="animal-history-event"
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.markerColumn}
      >
        {!isFirst ? <View style={styles.lineTop} /> : null}
        {!isLast ? <View style={styles.lineBottom} /> : null}
        <View style={[styles.marker, { backgroundColor: colors[visual.tone] }]}>
          <AppIcon color="textInverse" name={visual.icon} />
        </View>
      </View>
      <AppCard style={styles.card} variant="elevated">
        <AppText variant="heading3">{label}</AppText>
        <AppText>{event.description}</AppText>
        <AppText color="textSecondary" variant="caption">
          {date}
        </AppText>
      </AppCard>
    </View>
  );
});

const lineLeft = (sizes.touchTarget - sizes.divider) / 2;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  lineBottom: {
    backgroundColor: colors.divider,
    bottom: -spacing.sm,
    left: lineLeft,
    position: 'absolute',
    top: '50%',
    width: sizes.divider,
  },
  lineTop: {
    backgroundColor: colors.divider,
    bottom: '50%',
    left: lineLeft,
    position: 'absolute',
    top: 0,
    width: sizes.divider,
  },
  marker: {
    alignItems: 'center',
    borderRadius: radii.full,
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
  markerColumn: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
  row: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
