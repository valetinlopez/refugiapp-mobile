import { Platform } from 'react-native';

import { expoPushProvider, resolveDevicePlatform, resolveProjectId } from './pushProvider';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { eas: { projectId: 'project-id-123' } } },
  },
}));

jest.mock('expo-device', () => ({ isDevice: true }));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addPushTokenListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { DEFAULT: 3 },
  IosAuthorizationStatus: { PROVISIONAL: 3, EPHEMERAL: 4 },
}));

const Notifications = jest.requireMock('expo-notifications') as {
  getPermissionsAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
};

describe('pushProvider utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('resolves the device platform for native platforms', () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'android');
    expect(resolveDevicePlatform()).toBe('android');
    platform.restore();
  });

  it('returns null for web', () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'web');
    expect(resolveDevicePlatform()).toBeNull();
    platform.restore();
  });

  it('reads the EAS project id from expo config', () => {
    expect(resolveProjectId()).toBe('project-id-123');
  });

  it('maps a granted permission', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: true });
    await expect(expoPushProvider.getPermissionState()).resolves.toBe('granted');
  });

  it('maps a denied permission that can ask again to denied', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({
      granted: false,
      canAskAgain: true,
    });
    await expect(expoPushProvider.getPermissionState()).resolves.toBe('denied');
  });

  it('maps a denied permission that cannot ask again to blocked', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({
      granted: false,
      canAskAgain: false,
    });
    await expect(expoPushProvider.getPermissionState()).resolves.toBe('blocked');
  });
});
