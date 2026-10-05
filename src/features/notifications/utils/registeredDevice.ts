import { apiClient, type HttpClient } from '@/core/api';

import { notificationsApi } from '../api/notificationsApi';

export interface RegisteredDevice {
  deviceId: string;
  expoPushToken: string;
  userId: string;
}

/**
 * In-memory registry of the device registered during the current session.
 * It intentionally holds the Expo token only in memory (never persisted, never
 * logged) and lets `unregisterCurrentDevice` remove the exact device row on
 * logout without listing or guessing other devices of the user.
 */
let current: RegisteredDevice | null = null;

export function getRegisteredDevice(): RegisteredDevice | null {
  return current;
}

export function setRegisteredDevice(device: RegisteredDevice): void {
  current = device;
}

export function clearRegisteredDevice(): void {
  current = null;
}

/**
 * Best-effort device removal for the sign-out flow. Runs while the session is
 * still valid; network or 404 failures are swallowed because the local session
 * cleanup must always proceed.
 */
export async function unregisterCurrentDevice(client: HttpClient = apiClient): Promise<void> {
  const device = current;
  if (device === null) {
    return;
  }
  current = null;
  try {
    await notificationsApi.removeDevice(device.deviceId, client);
  } catch {
    // Best-effort: the backend deactivates tokens that the provider rejects.
  }
}
