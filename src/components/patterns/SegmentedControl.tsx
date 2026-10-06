import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import type { AppIconName } from '@/components/primitives';
import { spacing } from '@/theme';

import { FilterChip } from './FilterChip';

export interface SegmentedControlOption<TValue extends string> {
  disabled?: boolean | undefined;
  icon?: AppIconName | undefined;
  id: TValue;
  label: string;
}

export interface SegmentedControlProps<TValue extends string> {
  accessibilityLabel?: string | undefined;
  onChange(value: TValue): void;
  options: readonly SegmentedControlOption<TValue>[];
  style?: StyleProp<ViewStyle>;
  testID?: string | undefined;
  value: TValue;
}

/**
 * Shared segmented control (D03 / RFG-136).
 *
 * A single-select group of chips used to switch views (animal detail tabs) or
 * to filter dense listings (tasks, expenses, veterinarians, audit). It reuses
 * `FilterChip` for the visual language and exposes proper radio semantics:
 * the container is a `radiogroup` and each option is a `radio` with `checked`
 * state, so selection never relies on color alone. Options scroll
 * horizontally to avoid clipping with amplified fonts or on narrow screens.
 */
export function SegmentedControl<TValue extends string>({
  accessibilityLabel,
  onChange,
  options,
  style,
  testID,
  value,
}: SegmentedControlProps<TValue>) {
  return (
    <ScrollView
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
      contentContainerStyle={styles.content}
      horizontal
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
      testID={testID}
    >
      {options.map((option) => (
        <FilterChip
          accessibilityRole="radio"
          disabled={option.disabled}
          icon={option.icon}
          key={option.id}
          label={option.label}
          onPress={() => onChange(option.id)}
          selected={option.id === value}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  content: {
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
});
