import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radii, sizes, spacing } from '@/theme';
import type { BadgeTone } from '@/types/design-system';

import { AppIcon, type AppIconName } from './AppIcon';
import { AppText } from './AppText';

export type AppBadgeProps = ViewProps & {
  icon?: AppIconName | undefined;
  label: string;
  labelNumberOfLines?: number | undefined;
  tone?: BadgeTone | undefined;
};

const toneStyles: Record<BadgeTone, ViewStyle> = {
  positive: { backgroundColor: colors.positive },
  warning: { backgroundColor: colors.warning },
  danger: { backgroundColor: colors.danger },
  info: { backgroundColor: colors.info },
  neutral: { backgroundColor: colors.neutral },
  default: { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 },
};

export function AppBadge({
  icon,
  label,
  labelNumberOfLines = 2,
  style,
  tone = 'default',
  ...props
}: AppBadgeProps) {
  const contentColor = tone === 'default' ? 'textPrimary' : 'textInverse';

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="text"
      style={[styles.base, toneStyles[tone], style]}
      {...props}
    >
      {icon ? <AppIcon color={contentColor} name={icon} size={sizes.iconSm} /> : null}
      <AppText color={contentColor} numberOfLines={labelNumberOfLines} variant="label">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
