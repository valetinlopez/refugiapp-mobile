import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

export interface FilterChipProps {
  accessibilityLabel?: string;
  label: string;
  onPress(): void;
  selected: boolean;
}

export function FilterChip({ accessibilityLabel, label, onPress, selected }: FilterChipProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <AppText color={selected ? 'textInverse' : 'textPrimary'} variant="label">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    backgroundColor: colors.positive,
    borderColor: colors.positive,
  },
});
