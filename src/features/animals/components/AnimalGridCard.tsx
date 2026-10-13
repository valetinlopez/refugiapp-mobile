import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge, AppCard, AppIcon, AppText } from '@/components/primitives';
import { optimizeCloudinaryImageUrl } from '@/core/media';
import { colors, opacity, radii, sizes, spacing } from '@/theme';

import { useAnimalPhoto } from '../hooks/useAnimalPhoto';
import type { Animal } from '../types';
import { animalGridAccessibilityLabel } from '../utils/animalListPresentation';
import { getStatusBadge } from '../utils/animalTransitions';

export interface AnimalGridCardProps {
  animal: Animal;
  onPress(animal: Animal): void;
}

/**
 * Adaptive grid cell for the animals listing (D37 / RFG-170, stabilized D41 / RFG-180).
 *
 * Photo-first card: optimized profile photo (or initials fallback), name,
 * `species · breed` when the breed exists, and a text+icon status badge so the
 * state never relies on color alone. The whole card is a single accessible
 * button that opens the animal detail.
 */
export const AnimalGridCard = memo(function AnimalGridCard({
  animal,
  onPress,
}: AnimalGridCardProps) {
  const badge = getStatusBadge(animal.status);
  const photoQuery = useAnimalPhoto(animal.profilePhotoMediaId);
  const photoUri = photoQuery.data
    ? optimizeCloudinaryImageUrl(photoQuery.data, { width: 512 })
    : null;
  const meta = animal.breed ? `${animal.species} · ${animal.breed}` : animal.species;

  return (
    <Pressable
      accessibilityHint="Abre la ficha del animal"
      accessibilityLabel={animalGridAccessibilityLabel(animal, badge.label)}
      accessibilityRole="button"
      onPress={() => onPress(animal)}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      testID="animal-grid-card"
    >
      <AppCard padded={false} style={styles.card} variant="elevated">
        <View style={styles.photo}>
          {photoUri ? (
            <Image
              accessibilityLabel={`Foto de ${animal.name}`}
              accessible
              allowDownscaling
              cachePolicy="memory-disk"
              contentFit="cover"
              recyclingKey={photoUri}
              source={{ uri: photoUri }}
              style={styles.image}
              testID="animal-grid-card-image"
            />
          ) : (
            <View
              accessibilityLabel={`Sin foto de ${animal.name}`}
              accessibilityRole="image"
              style={styles.fallback}
            >
              <AppText variant="heading2">{animal.name.slice(0, 2).toUpperCase()}</AppText>
            </View>
          )}
        </View>
        <View style={styles.body}>
          <AppText ellipsizeMode="tail" numberOfLines={2} variant="heading3">
            {animal.name}
          </AppText>
          <AppText color="textSecondary" ellipsizeMode="tail" numberOfLines={1} variant="caption">
            {meta}
          </AppText>
          <View style={styles.footer}>
            <AppBadge
              icon={badge.icon}
              label={badge.label}
              labelNumberOfLines={1}
              style={styles.badge}
              tone={badge.tone}
            />
            <AppIcon
              color="textSecondary"
              name="chevronRight"
              size={sizes.iconMd}
              style={styles.chevron}
            />
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexShrink: 1,
    minWidth: 0,
  },
  body: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
    padding: spacing.md,
  },
  card: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  chevron: {
    flexShrink: 0,
  },
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    minWidth: 0,
    paddingTop: spacing.xxs,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  photo: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.surfaceElevated,
    width: '100%',
  },
  pressable: {
    borderRadius: radii.lg,
    flex: 1,
    minWidth: 0,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
