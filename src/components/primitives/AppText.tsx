import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, typography, type ColorToken } from '@/theme';
import type { TypographyVariant } from '@/theme/typography';

export type AppTextProps = TextProps & {
  color?: ColorToken;
  variant?: TypographyVariant;
};

export function AppText({
  allowFontScaling = true,
  color = 'textPrimary',
  maxFontSizeMultiplier = 1.8,
  style,
  variant = 'body',
  ...props
}: AppTextProps) {
  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[typography[variant] as TextStyle, { color: colors[color] }, style]}
      {...props}
    />
  );
}
