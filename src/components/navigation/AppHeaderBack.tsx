import { router, type Href } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppIcon, AppText } from '@/components/primitives';
import { radii, sizes, spacing } from '@/theme';

export type AppHeaderBackProps = Omit<PressableProps, 'children' | 'onPress' | 'style'> & {
  accessibilityHint?: string;
  fallbackHref: Href;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function navigateBack(fallbackHref: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackHref);
  }
}

export function AppHeaderBack({
  accessibilityHint,
  fallbackHref,
  label = 'Volver',
  style,
  ...props
}: AppHeaderBackProps) {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={sizes.hitSlop}
      onPress={() => navigateBack(fallbackHref)}
      style={({ pressed }) => [styles.base, pressed && styles.pressed, style]}
      {...props}
    >
      <AppIcon color="textPrimary" name="chevronLeft" size={sizes.iconMd} />
      <AppText color="textPrimary" variant="button">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.72,
  },
});
