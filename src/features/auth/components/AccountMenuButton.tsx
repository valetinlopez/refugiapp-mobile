import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AppIcon } from '@/components/primitives';
import { radii, sizes, spacing } from '@/theme';

export function AccountMenuButton() {
  return (
    <Pressable
      accessibilityLabel="Abrir menú de cuenta"
      accessibilityRole="button"
      hitSlop={spacing.xxs}
      onPress={() => router.push('/more')}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <AppIcon color="textPrimary" name="account" size={sizes.iconMd} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.sm,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
  },
  pressed: {
    opacity: 0.72,
  },
});
