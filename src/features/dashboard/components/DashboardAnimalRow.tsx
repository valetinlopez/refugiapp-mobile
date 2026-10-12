import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppAvatar,
  AppIcon,
  AppText,
  AnimalStatusBadge,
  getAnimalStatusLabel,
} from '@/components/primitives';
import { opacity, spacing } from '@/theme';

import { useDashboardAnimalPhoto } from '../hooks/useDashboardAnimalPhoto';
import type { DashboardAnimal } from '../types';
import { formatSpeciesLabel } from '../utils/animalText';

export interface DashboardAnimalRowProps {
  animal: DashboardAnimal;
  onPress(animal: DashboardAnimal): void;
}

/**
 * One "Animales recientes" row (D40 / RFG-176).
 *
 * The animal state renders as a compact icon-only badge: long labels such as
 * "Disponible para adopción" can no longer truncate or wrap at 320 pt or
 * 200 % font scale, while the row keeps announcing the full state.
 */
export const DashboardAnimalRow = memo(function DashboardAnimalRow({
  animal,
  onPress,
}: DashboardAnimalRowProps) {
  const photoQuery = useDashboardAnimalPhoto(animal.profilePhotoMediaId);
  const statusLabel = getAnimalStatusLabel(animal.status);
  const speciesLabel = formatSpeciesLabel(animal.species);

  return (
    <Pressable
      accessibilityLabel={`${animal.name}, ${speciesLabel}, ${statusLabel}`}
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
          {speciesLabel}
        </AppText>
      </View>
      <View style={styles.badgeWrap}>
        <AnimalStatusBadge status={animal.status} variant="compact" />
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
    minHeight: 44,
  },
});
