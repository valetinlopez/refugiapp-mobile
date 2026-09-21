import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, sizes, spacing } from '@/theme';

import { AppIcon, type AppIconName } from './AppIcon';
import { AppText } from './AppText';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon?: AppIconName;
  label: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: AppButtonVariant;
};

const variantStyles: Record<AppButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.positive },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
  },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: colors.transparent },
};

export function AppButton({
  accessibilityLabel,
  disabled = false,
  icon,
  label,
  loading = false,
  style,
  variant = 'primary',
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const usesInverseText = variant === 'primary' || variant === 'danger';
  const contentColor = usesInverseText ? 'textInverse' : 'textPrimary';

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors[contentColor]} />
      ) : (
        <View style={styles.content}>
          {icon ? <AppIcon color={contentColor} name={icon} size={sizes.iconSm} /> : null}
          <AppText color={contentColor} variant="button">
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.full,
    justifyContent: 'center',
    minHeight: sizes.buttonHeight,
    minWidth: sizes.touchTarget,
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: colors.disabledSurface,
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.84,
  },
});
