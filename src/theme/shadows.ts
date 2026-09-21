import { Platform, type ViewStyle } from 'react-native';

export const shadows = {
  none: {} satisfies ViewStyle,
  subtle:
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#1B100C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
      android: { elevation: 2 },
      default: {
        boxShadow: '0 6px 16px rgba(27, 16, 12, 0.16)',
      },
    }) ?? {},
  raised:
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#1B100C',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: { elevation: 4 },
      default: {
        boxShadow: '0 10px 24px rgba(27, 16, 12, 0.20)',
      },
    }) ?? {},
} as const;

export type ShadowToken = keyof typeof shadows;
