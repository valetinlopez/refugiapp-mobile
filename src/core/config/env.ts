import { Platform } from 'react-native';

export const config = {
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_URL ||
    (Platform.OS === 'android'
      ? 'http://10.0.2.2:3000/api/v1'
      : 'http://localhost:3000/api/v1'),
  appName: 'Refugiapp Mobile',
  appVersion: '1.0.0',
} as const;
