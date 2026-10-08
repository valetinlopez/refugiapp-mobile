import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge, AppCard, AppIcon, AppText } from '@/components/primitives';
import { opacity, sizes, spacing } from '@/theme';

import type { CareTask } from '../types';
import { formatCareTaskDate, getCareTaskStatusPresentation } from '../utils/careTaskPresentation';
import { CareTaskAnimalAvatar } from './CareTaskAnimalAvatar';

export interface CareTaskOverviewCardProps {
  animalName: string;
  onPress(): void;
  profilePhotoMediaId?: string | null | undefined;
  task: CareTask;
}

export function CareTaskOverviewCard({
  animalName,
  onPress,
  profilePhotoMediaId,
  task,
}: CareTaskOverviewCardProps) {
  const presentation = getCareTaskStatusPresentation(task.status, task.dueAt);
  const dateLabel = formatCareTaskDate(task.dueAt);
  const description = task.description?.trim();

  return (
    <Pressable
      accessibilityLabel={`${animalName}, ${task.title}${description ? `, ${description}` : ''}, ${dateLabel}, ${presentation.label}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
      testID="care-task-overview-card"
    >
      <AppCard style={styles.card} variant="elevated">
        <CareTaskAnimalAvatar
          name={animalName}
          profilePhotoMediaId={profilePhotoMediaId}
          size="lg"
        />
        <View style={styles.content}>
          <AppText numberOfLines={1} variant="heading3">
            {animalName}
          </AppText>
          <AppText numberOfLines={2} variant="bodyStrong">
            {task.title}
          </AppText>
          {description ? (
            <AppText color="textSecondary" numberOfLines={2}>
              {description}
            </AppText>
          ) : null}
          <View style={styles.dateRow}>
            <AppIcon color="textSecondary" name="calendar" size={sizes.iconSm} />
            <AppText color="textSecondary" numberOfLines={1} variant="caption">
              {dateLabel}
            </AppText>
          </View>
        </View>
        <View style={styles.trailing}>
          <AppBadge
            icon={presentation.icon}
            label={presentation.label}
            labelNumberOfLines={1}
            tone={presentation.tone}
          />
          <AppIcon color="textSecondary" name="chevronRight" size={sizes.iconMd} />
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  trailing: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: spacing.sm,
    maxWidth: '42%',
  },
});
