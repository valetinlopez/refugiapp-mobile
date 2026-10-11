import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

/**
 * Static loading placeholder for Inicio (D36 / RFG-169).
 *
 * The bars mirror the real layout (greeting, hero, summary, accesses,
 * priorities) so the first paint preserves the rhythm. It is a plain static
 * placeholder with an accessible progressbar role, so it needs no animation and
 * is compatible with reduce motion by construction.
 */
export function DashboardSkeleton() {
  return (
    <View
      accessibilityLabel="Cargando panel"
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={styles.container}
    >
      <View style={styles.heading}>
        <View style={styles.titleLine} />
        <View style={styles.subtitleLine} />
      </View>
      <View style={styles.hero} />
      <View style={styles.card}>
        <View style={styles.metricRow}>
          <View style={styles.metric} />
          <View style={styles.metric} />
          <View style={styles.metric} />
        </View>
      </View>
      <View style={styles.accessGrid}>
        <View style={styles.accessCell} />
        <View style={styles.accessCell} />
        <View style={styles.accessCell} />
        <View style={styles.accessCell} />
      </View>
      <View style={styles.card}>
        <View style={styles.mediumLine} />
        <View style={styles.row}>
          <View style={styles.avatar} />
          <View style={styles.lines}>
            <View style={styles.mediumLine} />
            <View style={styles.smallLine} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.avatar} />
          <View style={styles.lines}>
            <View style={styles.mediumLine} />
            <View style={styles.smallLine} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  accessCell: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flexBasis: '46%',
    flexGrow: 1,
    height: 72,
    minWidth: 148,
  },
  accessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  avatar: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.full,
    height: 48,
    width: 48,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.md,
  },
  container: {
    gap: spacing.lg,
  },
  heading: {
    gap: spacing.xs,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    height: 140,
  },
  lines: {
    flex: 1,
    gap: spacing.xs,
  },
  mediumLine: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    height: 18,
    width: 160,
  },
  metric: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    flexBasis: '28%',
    flexGrow: 1,
    height: 56,
    minWidth: 80,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  smallLine: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    height: 14,
    width: 96,
  },
  subtitleLine: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    height: 14,
    width: 140,
  },
  titleLine: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    height: 30,
    width: 200,
  },
});
