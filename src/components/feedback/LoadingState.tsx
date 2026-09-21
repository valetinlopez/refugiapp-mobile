import { ActivityIndicator, StyleSheet, View, type ViewProps } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, spacing } from '@/theme';

export type LoadingStateProps = ViewProps & {
  label?: string;
};

export function LoadingState({ label = 'Cargando', style, ...props }: LoadingStateProps) {
  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={[styles.container, style]}
      {...props}
    >
      <ActivityIndicator color={colors.positive} />
      <AppText color="textSecondary">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
  },
});
