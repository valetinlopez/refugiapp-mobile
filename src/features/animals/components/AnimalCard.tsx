import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge, AppCard, AppText } from '@/components/primitives';
import { radii, sizes, spacing } from '@/theme';

import type { Animal } from '../types';
import { getStatusBadge } from '../utils/animalTransitions';

import { AnimalCardAvatar } from './AnimalCardAvatar';

export interface AnimalCardProps {
  animal: Animal;
  onPress(animal: Animal): void;
}

export const AnimalCard = memo(function AnimalCard({ animal, onPress }: AnimalCardProps) {
  const badge = getStatusBadge(animal.status);

  return (
    <Pressable
      accessibilityLabel={`${animal.name}, ${animal.species}${animal.breed ? `, ${animal.breed}` : ''}, ${badge.label}`}
      accessibilityRole="button"
      onPress={() => onPress(animal)}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <AppCard padded={false} style={styles.card}>
        <AnimalCardAvatar name={animal.name} profilePhotoMediaId={animal.profilePhotoMediaId} />
        <View style={styles.body}>
          <AppText variant="heading3">{animal.name}</AppText>
          <AppText color="textSecondary" numberOfLines={1}>
            {animal.species}
            {animal.breed ? ` · ${animal.breed}` : ''}
          </AppText>
        </View>
        <AppBadge icon={badge.icon} label={badge.label} tone={badge.tone} />
      </AppCard>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  body: { flex: 1, gap: spacing.xxs },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
  },
  pressable: { borderRadius: radii.md },
  pressed: { opacity: 0.84 },
});
