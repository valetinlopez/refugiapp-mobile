import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge, AppCard, AppText } from '@/components/primitives';
import { radii, spacing } from '@/theme';

import type { VeterinarianResponse } from '../types';
import { veterinarianFullName } from '../utils/veterinarianPresentation';

export interface VeterinarianCardProps {
  onPress(veterinarian: VeterinarianResponse): void;
  veterinarian: VeterinarianResponse;
}

export const VeterinarianCard = memo(function VeterinarianCard({
  onPress,
  veterinarian,
}: VeterinarianCardProps) {
  const name = veterinarianFullName(veterinarian);

  return (
    <Pressable
      accessibilityLabel={`${name}, matrícula ${veterinarian.licenseNumber}, ${
        veterinarian.isActive ? 'Activo' : 'Inactivo'
      }`}
      accessibilityRole="button"
      onPress={() => onPress(veterinarian)}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <AppCard variant="outlined">
        <View style={styles.header}>
          <View style={styles.identity}>
            <AppText variant="heading3">{name}</AppText>
            <AppText color="textSecondary">Matrícula {veterinarian.licenseNumber}</AppText>
          </View>
          <AppBadge
            label={veterinarian.isActive ? 'Activo' : 'Inactivo'}
            tone={veterinarian.isActive ? 'positive' : 'neutral'}
          />
        </View>
      </AppCard>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  identity: { flex: 1, gap: spacing.xxs },
  pressable: { borderRadius: radii.lg },
  pressed: { opacity: 0.84 },
});
