import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import type { DevicePlatform, PushPermissionState } from '../types';

export const ANDROID_NOTIFICATION_CHANNEL_ID = 'care-tasks';

export type NotificationsModule = typeof import('expo-notifications');
export type LoadNotificationsModule = () => Promise<NotificationsModule | null>;

/**
 * True when running inside Expo Go. Remote push (and even loading
 * `expo-notifications`) is not available there on Android since SDK 53.
 */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;

/**
 * Loads `expo-notifications` lazily and tolerates builds where the module
 * fails during evaluation (Expo Go on Android since SDK 53 throws while
 * importing). Loading it here keeps the bundle safe and providers degrade to
 * "unavailable" instead of crashing the authenticated area.
 */
export function loadNotificationsModule(): Promise<NotificationsModule | null> {
  if (notificationsModulePromise === null) {
    notificationsModulePromise = import('expo-notifications').catch(() => null);
  }
  return notificationsModulePromise;
}

/**
 * Adapter boundary over the push provider (`expo-notifications`) and device
 * detection. Hooks depend on this interface so tests can inject a fake without
 * touching native modules.
 */
export interface PushProvider {
  /** True on a physical Android/iOS device where push tokens can be obtained. */
  isSupported(): boolean;
  getPermissionState(): Promise<PushPermissionState>;
  requestPermission(): Promise<PushPermissionState>;
  ensureAndroidChannel(): Promise<void>;
  getExpoPushToken(projectId: string): Promise<string>;
  addTokenRotationListener(listener: () => void): () => void;
}

export function resolveDevicePlatform(): DevicePlatform | null {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return null;
}

/**
 * EAS project id required by `getExpoPushTokenAsync`. Falls back to the legacy
 * `Constants.easConfig.projectId` shape and returns `null` when the project is
 * not configured, which the UI surfaces as "no disponible" instead of failing.
 */
export function resolveProjectId(): string | null {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: unknown } } | undefined;
  const candidates = [extra?.eas?.projectId, Constants.easConfig?.projectId];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }
  return null;
}

function toPermissionState(
  module: NotificationsModule,
  status: Awaited<ReturnType<NotificationsModule['getPermissionsAsync']>>
): PushPermissionState {
  const provisional =
    status.ios?.status === module.IosAuthorizationStatus.PROVISIONAL ||
    status.ios?.status === module.IosAuthorizationStatus.EPHEMERAL;
  if (status.granted || provisional) {
    return 'granted';
  }
  return status.canAskAgain ? 'denied' : 'blocked';
}

/**
 * Builds the production push provider over a lazily loaded module. The loader
 * is injectable so tests can exercise the degradation paths without native
 * modules. Every operation degrades to "unavailable" or a no-op when the
 * module cannot be reached.
 */
export function createExpoPushProvider(loadModule: LoadNotificationsModule): PushProvider {
  const isSupported = (): boolean => {
    return !isExpoGo() && resolveDevicePlatform() !== null && Device.isDevice;
  };

  return {
    isSupported,

    async getPermissionState() {
      if (!isSupported()) {
        return 'unavailable';
      }
      const module = await loadModule();
      if (module === null) {
        return 'unavailable';
      }
      return toPermissionState(module, await module.getPermissionsAsync());
    },

    async requestPermission() {
      if (!isSupported()) {
        return 'unavailable';
      }
      const module = await loadModule();
      if (module === null) {
        return 'unavailable';
      }
      const current = await module.getPermissionsAsync();
      if (current.granted || current.canAskAgain === false) {
        return toPermissionState(module, current);
      }
      return toPermissionState(module, await module.requestPermissionsAsync());
    },

    async ensureAndroidChannel() {
      if (Platform.OS !== 'android') {
        return;
      }
      const module = await loadModule();
      if (module === null) {
        return;
      }
      await module.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL_ID, {
        name: 'Tareas de cuidado',
        importance: module.AndroidImportance.DEFAULT,
      });
    },

    async getExpoPushToken(projectId) {
      const module = await loadModule();
      if (module === null) {
        throw new Error('Push provider is unavailable on this build');
      }
      const token = await module.getExpoPushTokenAsync({ projectId });
      return token.data;
    },

    addTokenRotationListener(listener) {
      let unsubscribe = () => {};
      let active = true;
      void loadModule().then((module) => {
        if (!active || module === null) {
          return;
        }
        const subscription = module.addPushTokenListener(() => {
          listener();
        });
        unsubscribe = () => subscription.remove();
      });
      return () => {
        active = false;
        unsubscribe();
      };
    },
  };
}

export const expoPushProvider: PushProvider = createExpoPushProvider(loadNotificationsModule);
