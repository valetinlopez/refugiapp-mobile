import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AppIcon } from '@/components/primitives';
import { radii, sizes } from '@/theme';

export function AccountMenuButton() {
  return (
    <Pressable
      accessibilityHint="Abre la pantalla Más con cuenta y gestión"
      accessibilityLabel="Abrir menú de cuenta"
      accessibilityRole="button"
      hitSlop={sizes.hitSlop}
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
