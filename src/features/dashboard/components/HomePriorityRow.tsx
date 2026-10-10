import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAnimalOptionPhoto } from '@/application/animals';
import { formatHomePriorityTime, type HomePriority } from '@/application/home';
import { AppAvatar, AppBadge, AppIcon, AppText } from '@/components/primitives';
import { opacity, spacing } from '@/theme';

import { getHomePriorityPresentation } from '../utils/presentation';

export interface HomePriorityRowProps {
  animalName: string;
  animalPhotoMediaId: string | null;
  onPress(priority: HomePriority): void;
  priority: HomePriority;
}

/**
 * One "Prioridades de hoy" row (D36 / RFG-169).
 *
 * Memoized and given stable callbacks by the list, it shows the resolved animal
 * (never a raw UUID), the due time in `es-AR` and a textual + iconic priority
 * badge. The animal photo is resolved through the shared `animal-options` cache,
 * so there is no request per row for animals without a photo.
 */
export const HomePriorityRow = memo(function HomePriorityRow({
  animalName,
  animalPhotoMediaId,
  onPress,
  priority,
}: HomePriorityRowProps) {
  const photoQuery = useAnimalOptionPhoto(animalPhotoMediaId);
  const presentation = getHomePriorityPresentation(priority.state);
  const timeLabel = formatHomePriorityTime(priority.dueAt);

  return (
    <Pressable
      accessibilityLabel={`${timeLabel}, ${priority.title}, ${animalName}, ${presentation.label}`}
      accessibilityRole="button"
      onPress={() => onPress(priority)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID="home-priority-row"
    >
      <AppAvatar
        accessibilityLabel={`Foto de ${animalName}`}
        initials={animalName}
        size="md"
        source={photoQuery.data ? { uri: photoQuery.data } : undefined}
        style={styles.fixed}
      />
      <View style={styles.copy}>
        <AppText numberOfLines={1} variant="bodyStrong">
          {`${timeLabel} · ${animalName}`}
        </AppText>
        <AppText color="textSecondary" ellipsizeMode="tail" numberOfLines={1} variant="caption">
          {priority.title}
        </AppText>
      </View>
      <View style={styles.badgeWrap}>
        <AppBadge
          icon={presentation.icon}
          label={presentation.label}
          labelNumberOfLines={1}
          tone={presentation.tone}
        />
      </View>
      <AppIcon color="textSecondary" name="chevronRight" style={styles.fixed} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  badgeWrap: {
    flexShrink: 0,
    maxWidth: '45%',
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  fixed: {
    flexShrink: 0,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.xs,
  },
});
