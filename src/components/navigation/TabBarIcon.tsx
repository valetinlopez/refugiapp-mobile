import { StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

export type TabBarIconProps = {
  focused: boolean;
  name: AppIconName;
};

export function TabBarIcon({ focused, name }: TabBarIconProps) {
  return (
    <View
      style={[styles.container, focused && styles.containerActive]}
      testID={`tab-bar-icon-${name}`}
    >
      <AppIcon color={focused ? 'positive' : 'textSecondary'} name={name} size={sizes.iconMd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radii.full,
    justifyContent: 'center',
    minHeight: sizes.iconLg,
    minWidth: sizes.touchTarget,
    paddingHorizontal: spacing.sm,
  },
  containerActive: {
    backgroundColor: colors.surfaceElevated,
  },
});
