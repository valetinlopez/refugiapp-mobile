import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppAvatar, AppBadge, AppIcon, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import { useDashboardAnimalPhoto } from '../hooks/useDashboardAnimalPhoto';
import type { DashboardAnimal } from '../types';
import { getStatusPresentation } from '../utils/presentation';

export interface DashboardAnimalRowProps {
  animal: DashboardAnimal;
  onPress(animal: DashboardAnimal): void;
}

export const DashboardAnimalRow = memo(function DashboardAnimalRow({
  animal,
  onPress,
}: DashboardAnimalRowProps) {
  const photoQuery = useDashboardAnimalPhoto(animal.profilePhotoMediaId);
  const presentation = getStatusPresentation(animal.status);

  return (
    <Pressable
      accessibilityLabel={`${animal.name}, ${animal.species}, ${presentation.label}`}
      accessibilityRole="button"
      onPress={() => onPress(animal)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID="dashboard-animal-row"
    >
      <AppAvatar
        accessibilityLabel={`Foto de ${animal.name}`}
        initials={animal.name.slice(0, 2)}
        size="sm"
        source={photoQuery.data ? { uri: photoQuery.data } : undefined}
        style={styles.fixed}
      />
      <View style={styles.copy}>
        <AppText ellipsizeMode="tail" numberOfLines={1} variant="bodyStrong">
          {animal.name}
        </AppText>
        <AppText color="textSecondary" ellipsizeMode="tail" numberOfLines={1} variant="caption">
          {animal.species}
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
    opacity: 0.84,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 44,
  },
});
