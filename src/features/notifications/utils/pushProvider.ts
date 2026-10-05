import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { DevicePlatform, PushPermissionState } from '../types';

export const ANDROID_NOTIFICATION_CHANNEL_ID = 'care-tasks';

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
  status: Notifications.NotificationPermissionsStatus
): PushPermissionState {
  const provisional =
    status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    status.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL;
  if (status.granted || provisional) {
    return 'granted';
  }
  return status.canAskAgain ? 'denied' : 'blocked';
}

export const expoPushProvider: PushProvider = {
  isSupported() {
    return resolveDevicePlatform() !== null && Device.isDevice;
  },

  async getPermissionState() {
    if (!this.isSupported()) {
      return 'unavailable';
    }
    return toPermissionState(await Notifications.getPermissionsAsync());
  },

  async requestPermission() {
    if (!this.isSupported()) {
      return 'unavailable';
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || current.canAskAgain === false) {
      return toPermissionState(current);
    }
    return toPermissionState(await Notifications.requestPermissionsAsync());
  },

  async ensureAndroidChannel() {
    if (Platform.OS !== 'android') {
      return;
    }
    await Notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL_ID, {
      name: 'Tareas de cuidado',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  },

  async getExpoPushToken(projectId) {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  },

  addTokenRotationListener(listener) {
    const subscription = Notifications.addPushTokenListener(() => {
      listener();
    });
    return () => subscription.remove();
  },
};
