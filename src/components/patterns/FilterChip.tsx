import { Pressable, StyleSheet } from 'react-native';

import { AppIcon, AppText, type AppIconName } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

export type FilterChipRole = 'button' | 'radio' | 'tab';

export interface FilterChipProps {
  accessibilityHint?: string | undefined;
  accessibilityLabel?: string | undefined;
  /**
   * Selection semantics. `button` (default) is a standalone filter toggle;
   * `radio` is used by `SegmentedControl` inside a `radiogroup`, exposing
   * `checked` instead of `selected`.
   */
  accessibilityRole?: FilterChipRole | undefined;
  disabled?: boolean | undefined;
  icon?: AppIconName | undefined;
  label: string;
  onPress(): void;
  selected: boolean;
  testID?: string | undefined;
}

export function FilterChip({
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole = 'button',
  disabled = false,
  icon,
  label,
  onPress,
  selected,
  testID,
}: FilterChipProps) {
  const isRadio = accessibilityRole === 'radio';
  const accessibilityState = isRadio ? { checked: selected, disabled } : { selected, disabled };
  const contentColor = disabled ? 'disabledText' : selected ? 'textInverse' : 'textPrimary';

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      disabled={disabled}
      hitSlop={sizes.hitSlop}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected, disabled && styles.chipDisabled]}
      testID={testID}
    >
      {icon ? <AppIcon color={contentColor} name={icon} size={sizes.iconSm} /> : null}
      <AppText color={contentColor} variant="label">
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
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  chipDisabled: {
    backgroundColor: colors.disabledSurface,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.positive,
    borderColor: colors.positive,
  },
});
