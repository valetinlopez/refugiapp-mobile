import { StyleSheet, View } from 'react-native';

import { AppAvatar, AppBadge, AppCard, AppText } from '@/components/primitives';
import type { Animal } from '@/features/animals/types';
import { getStatusBadge } from '@/features/animals/utils/animalTransitions';
import { sizes, spacing } from '@/theme';

export interface AnimalDetailHeaderProps {
  animal: Pick<Animal, 'breed' | 'name' | 'species' | 'status'>;
  photoUri: string | null;
}

export function AnimalDetailHeader({ animal, photoUri }: AnimalDetailHeaderProps) {
  const badge = getStatusBadge(animal.status);
  const description = animal.breed ? `${animal.species} · ${animal.breed}` : animal.species;

  return (
    <AppCard
      accessibilityLabel={`${animal.name}. ${description}. Estado: ${badge.label}`}
      accessibilityRole="summary"
      style={styles.card}
      variant="organic"
    >
      <View style={styles.layout}>
        <AppAvatar
          accessibilityLabel={photoUri ? `Foto de ${animal.name}` : `Sin foto de ${animal.name}`}
          initials={animal.name.slice(0, 2)}
          shape="rounded"
          size="xl"
          source={photoUri ? { uri: photoUri } : undefined}
        />
        <View style={styles.identity} testID="animal-detail-identity">
          <AppText accessibilityRole="header" variant="display">
            {animal.name}
          </AppText>
          <AppText color="textSecondary" variant="bodyStrong">
            {description}
          </AppText>
          <AppBadge icon={badge.icon} label={badge.label} tone={badge.tone} />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  identity: {
    flex: 1,
    gap: spacing.xs,
    minWidth: sizes.avatarXl,
  },
  layout: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
});
