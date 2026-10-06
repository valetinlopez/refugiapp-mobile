import { StyleSheet, View, type ViewProps } from 'react-native';

import { AppText } from '@/components/primitives';
import { spacing } from '@/theme';

export type MetadataRowProps = ViewProps & {
  /** Already localized label (e.g. "Fecha de ingreso"). */
  label: string;
  /** Already formatted value. Dates must go through `dateFormat`, never raw ISO. */
  value: string;
};

/**
 * Shared label/value row (D03 / RFG-136).
 *
 * The building block of entity detail screens (animal, expense, veterinarian,
 * audit). The label never shrinks and the value wraps aligned to the end, so
 * long values and amplified fonts stack instead of colliding on narrow
 * screens. Formatting stays in the feature: dates come pre-formatted in
 * `es-AR` through `dateFormat` and money through the currency formatter.
 */
export function MetadataRow({ label, style, value, ...props }: MetadataRowProps) {
  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      accessibilityRole="summary"
      style={[styles.row, style]}
      {...props}
    >
      <AppText color="textSecondary" style={styles.label} variant="label">
        {label}
      </AppText>
      <AppText style={styles.value} variant="bodyStrong">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    flexShrink: 0,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  value: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
  },
});
