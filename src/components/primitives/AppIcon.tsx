import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';

import { colors, sizes, type ColorToken } from '@/theme';

export type AppIconName =
  | 'account'
  | 'alert'
  | 'calendar'
  | 'check'
  | 'chevronLeft'
  | 'chevronRight'
  | 'clock'
  | 'close'
  | 'error'
  | 'heart'
  | 'home'
  | 'info'
  | 'logout'
  | 'medical'
  | 'menu'
  | 'money'
  | 'offline'
  | 'paw'
  | 'refresh';

const iconNames: Record<AppIconName, SymbolViewProps['name']> = {
  account: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' },
  alert: { ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  chevronLeft: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  clock: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  error: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  info: { ios: 'info.circle.fill', android: 'info', web: 'info' },
  logout: {
    ios: 'rectangle.portrait.and.arrow.right',
    android: 'logout',
    web: 'logout',
  },
  medical: { ios: 'stethoscope', android: 'stethoscope', web: 'stethoscope' },
  menu: { ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' },
  money: { ios: 'banknote.fill', android: 'payments', web: 'payments' },
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
