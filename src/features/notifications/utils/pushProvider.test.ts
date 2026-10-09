import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import {
  createExpoPushProvider,
  expoPushProvider,
  isExpoGo,
  resolveDevicePlatform,
  resolveProjectId,
  type NotificationsModule,
} from './pushProvider';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { eas: { projectId: 'project-id-123' } } },
    executionEnvironment: 'bare',
  },
  ExecutionEnvironment: { Bare: 'bare', StoreClient: 'storeClient', Standalone: 'standalone' },
}));

jest.mock('expo-device', () => ({ isDevice: true }));

jest.mock('expo-notifications', () => ({
  __esModule: true,
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addPushTokenListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { DEFAULT: 3 },
  IosAuthorizationStatus: { PROVISIONAL: 3, EPHEMERAL: 4 },
}));

const Notifications = jest.requireMock('expo-notifications') as unknown as {
  getPermissionsAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
} & NotificationsModule;

const providerWithModule = () => createExpoPushProvider(() => Promise.resolve(Notifications));

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

  it('detects Expo Go by execution environment', () => {
    expect(isExpoGo()).toBe(false);
    const env = jest.replaceProperty(
      Constants,
      'executionEnvironment',
      ExecutionEnvironment.StoreClient
    );
    expect(isExpoGo()).toBe(true);
    env.restore();
  });

  it('maps a granted permission', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: true });
    await expect(providerWithModule().getPermissionState()).resolves.toBe('granted');
  });

  it('maps a denied permission that can ask again to denied', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({
      granted: false,
      canAskAgain: true,
    });
    await expect(providerWithModule().getPermissionState()).resolves.toBe('denied');
  });

  it('maps a denied permission that cannot ask again to blocked', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({
      granted: false,
      canAskAgain: false,
    });
    await expect(providerWithModule().getPermissionState()).resolves.toBe('blocked');
  });
});

describe('pushProvider degradation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reports unavailable inside Expo Go without loading the module', async () => {
    const env = jest.replaceProperty(
      Constants,
      'executionEnvironment',
      ExecutionEnvironment.StoreClient
    );
    try {
      await expect(expoPushProvider.getPermissionState()).resolves.toBe('unavailable');
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    } finally {
      env.restore();
    }
  });

  it('reports unavailable when the notifications module cannot load', async () => {
    const provider = createExpoPushProvider(() => Promise.resolve(null));

    await expect(provider.getPermissionState()).resolves.toBe('unavailable');
    await expect(provider.requestPermission()).resolves.toBe('unavailable');
    await expect(provider.ensureAndroidChannel()).resolves.toBeUndefined();
  });
});
