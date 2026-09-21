import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';

import { colors, sizes, type ColorToken } from '@/theme';

export type AppIconName =
  | 'alert'
  | 'calendar'
  | 'check'
  | 'chevronRight'
  | 'clock'
  | 'close'
  | 'error'
  | 'heart'
  | 'home'
  | 'info'
  | 'medical'
  | 'menu'
  | 'offline'
  | 'paw'
  | 'refresh';

const iconNames: Record<AppIconName, SymbolViewProps['name']> = {
  alert: { ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  clock: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  error: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  info: { ios: 'info.circle.fill', android: 'info', web: 'info' },
  medical: { ios: 'stethoscope', android: 'stethoscope', web: 'stethoscope' },
  menu: { ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' },
  offline: { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' },
  paw: { ios: 'pawprint.fill', android: 'pets', web: 'pets' },
  refresh: { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' },
};

export type AppIconProps = {
  accessibilityLabel?: string;
  color?: ColorToken | ColorValue;
  name: AppIconName;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function AppIcon({
  accessibilityLabel,
  color = 'textPrimary',
  name,
  size = sizes.iconMd,
  style,
}: AppIconProps) {
  const tintColor = color in colors ? colors[color as ColorToken] : color;

  return (
    <View
      accessibilityElementsHidden={accessibilityLabel === undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel === undefined ? undefined : 'image'}
      importantForAccessibility={accessibilityLabel === undefined ? 'no-hide-descendants' : 'auto'}
      style={[{ height: size, width: size }, style]}
    >
      <SymbolView name={iconNames[name]} size={size} tintColor={tintColor} />
    </View>
  );
}
