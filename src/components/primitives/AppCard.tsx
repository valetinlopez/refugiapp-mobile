import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';

export type AppCardVariant = 'default' | 'elevated' | 'outlined' | 'organic';

export type AppCardProps = ViewProps & {
  padded?: boolean;
  variant?: AppCardVariant;
};

export function AppCard({
  children,
  padded = true,
  style,
  variant = 'default',
  ...props
}: AppCardProps) {
  return (
    <View style={[styles.base, styles[variant], padded && styles.padded, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
  default: {},
  elevated: {
    backgroundColor: colors.surfaceElevated,
    ...shadows.subtle,
  },
  organic: {
    backgroundColor: colors.surfaceElevated,
    borderBottomLeftRadius: radii.organic,
    borderTopRightRadius: radii.organic,
    ...shadows.raised,
  },
  outlined: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderWidth: 1,
  },
  padded: {
    padding: spacing.md,
  },
});
