import { StyleSheet, View } from 'react-native';

import { AppCard, AppDivider, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import type { DashboardAnimal } from '../types';
import { DashboardAnimalRow } from './DashboardAnimalRow';

export interface DashboardRecentAnimalsProps {
  animals: DashboardAnimal[];
  onPress(animal: DashboardAnimal): void;
}

export function DashboardRecentAnimals({ animals, onPress }: DashboardRecentAnimalsProps) {
  return (
    <View style={styles.section}>
      <AppText variant="heading2">Animales recientes</AppText>
      {animals.length === 0 ? (
        <AppCard>
          <AppText color="textSecondary">Aún no hay animales recientes para mostrar.</AppText>
        </AppCard>
      ) : (
        <AppCard>
          {animals.map((animal, index) => (
            <View key={animal.id} style={styles.row}>
              {index > 0 ? <AppDivider style={styles.divider} /> : null}
              <DashboardAnimalRow animal={animal} onPress={onPress} />
            </View>
          ))}
        </AppCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    marginVertical: spacing.xxs,
  },
  row: {
    paddingVertical: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
});
