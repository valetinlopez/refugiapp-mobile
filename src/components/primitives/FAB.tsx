import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, opacity, radii, shadows, sizes, spacing } from '@/theme';

import { AppIcon, type AppIconName } from './AppIcon';

export type FABProps = Omit<PressableProps, 'children' | 'style'> & {
  accessibilityHint?: string;
  accessibilityLabel: string;
  /**
   * Distance from the bottom edge. Defaults to the device safe-area inset plus
   * a spacing step; screens that already have a bottom navigation pass a larger
   * offset (`insets.bottom + sizes.bottomNavigationHeight + spacing.md`).
   */
  bottomOffset?: number | undefined;
  icon?: AppIconName | undefined;
  loading?: boolean;
};

/**
 * Shared floating action button (D03 / RFG-136).
 *
 * The primary contextual action of a screen ("Nueva tarea", "Registrar gasto").
 * Sits above the safe-area inset, keeps a 56 pt target, exposes a required
 * accessible label and communicates busy/disabled states with text semantics,
 * not color alone. Pressed feedback is a plain opacity change, so it is
 * compatible with reduce motion by construction.
 */
export function FAB({
  accessibilityHint,
  accessibilityLabel,
  bottomOffset,
  disabled = false,
  icon = 'add',
  loading = false,
  ...props
}: FABProps) {
  const insets = useSafeAreaInsets();
  const isDisabled = disabled || loading;
  const bottom = bottomOffset ?? insets.bottom + spacing.lg;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      hitSlop={sizes.hitSlop}
      style={({ pressed }) => [
        styles.base,
        { bottom, right: spacing.md },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors.textInverse} />
      ) : (
        <AppIcon color="textInverse" name={icon} size={sizes.iconLg} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    backgroundColor: colors.positive,
    borderRadius: radii.full,
    height: sizes.fab,
    justifyContent: 'center',
    position: 'absolute',
    width: sizes.fab,
    ...shadows.raised,
  },
  disabled: {
    backgroundColor: colors.disabledSurface,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
