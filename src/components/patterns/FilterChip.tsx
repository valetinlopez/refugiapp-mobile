import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

export interface FilterChipProps {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  label: string;
  onPress(): void;
  selected: boolean;
  testID?: string;
}

export function FilterChip({
  accessibilityHint,
  accessibilityLabel,
  label,
  onPress,
  selected,
  testID,
}: FilterChipProps) {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={sizes.hitSlop}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      testID={testID}
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
    minWidth: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    backgroundColor: colors.positive,
    borderColor: colors.positive,
  },
});
