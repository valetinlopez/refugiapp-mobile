import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, sizes } from '@/theme';

export function AppDivider({ style, ...props }: ViewProps) {
  return <View accessibilityRole="none" style={[styles.divider, style]} {...props} />;
}

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.divider,
    height: sizes.divider,
    width: '100%',
  },
});
