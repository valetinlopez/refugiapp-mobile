import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

import type { AnimalHistoryEvent } from '../types';
import {
  formatAnimalEventDateLabel,
  getAnimalEventDescription,
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
  const description = getAnimalEventDescription(event);
  const date = formatAnimalEventDateLabel(event.occurredAt);

  return (
    <View
      accessibilityLabel={`${label}. ${description}. ${date}`}
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
        <AppText accessibilityRole="header" variant="heading3">
          {label}
        </AppText>
        <AppText style={styles.description}>{description}</AppText>
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
    flexShrink: 1,
    gap: spacing.xs,
    maxWidth: '100%',
    minWidth: 0,
  },
  description: {
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: '100%',
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
    justifyContent: 'flex-start',
    paddingTop: spacing.xxs,
    width: sizes.touchTarget,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
