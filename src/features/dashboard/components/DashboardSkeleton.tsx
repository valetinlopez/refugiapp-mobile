import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

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
      <View style={styles.card}>
        <View style={styles.bigLine} />
        <View style={styles.badgeRow}>
          <View style={styles.chip} />
          <View style={styles.chip} />
          <View style={styles.chip} />
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.mediumLine} />
        <View style={styles.animalRow}>
          <View style={styles.avatar} />
          <View style={styles.animalLines}>
            <View style={styles.mediumLine} />
            <View style={styles.smallLine} />
          </View>
        </View>
        <View style={styles.animalRow}>
          <View style={styles.avatar} />
          <View style={styles.animalLines}>
            <View style={styles.mediumLine} />
            <View style={styles.smallLine} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  animalLines: {
    flex: 1,
    gap: spacing.xs,
  },
  animalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.full,
    height: 36,
    width: 36,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  bigLine: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    height: 44,
    width: 120,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.md,
  },
  chip: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.full,
    height: 24,
    width: 96,
  },
  container: {
    gap: spacing.lg,
  },
  heading: {
    gap: spacing.xs,
  },
  mediumLine: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    height: 18,
    width: 160,
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
    width: 180,
  },
});
