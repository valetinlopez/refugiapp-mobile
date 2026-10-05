import type { components } from '@/core/api/generated/openapi';

export type RegisterDeviceRequest = components['schemas']['RegisterDeviceDto'];
export type DeviceSubscriptionResponse = components['schemas']['DeviceSubscriptionResponseDto'];
export type NotificationPreferenceResponse =
  components['schemas']['NotificationPreferenceResponseDto'];
export type UpdateNotificationPreferencesRequest = components['schemas']['UpdatePreferencesDto'];

/**
 * Platform value accepted by the backend (`device_platform`). Web is never a
 * valid push platform, so it is not part of this union.
 */
export type DevicePlatform = 'ios' | 'android';

/**
 * Normalized notification permission state. `blocked` means the OS will not
 * prompt again and the user must change it from system settings; `unavailable`
 * covers web, simulators/emulators without push support and builds without an
 * EAS project id.
 */
export type PushPermissionState = 'granted' | 'denied' | 'blocked' | 'unavailable';

export type PushRegistrationStatus =
  'idle' | 'registering' | 'registered' | 'error' | 'unavailable';

export interface NotificationPreferences {
  overdueEnabled: boolean;
  upcomingEnabled: boolean;
  upcomingWindowMinutes: number;
  quietStart: string | null;
  quietEnd: string | null;
  timezone: string;
}

export function toNotificationPreferences(
  dto: NotificationPreferenceResponse
): NotificationPreferences {
  return {
    overdueEnabled: dto.overdueEnabled,
    upcomingEnabled: dto.upcomingEnabled,
    upcomingWindowMinutes: dto.upcomingWindowMinutes,
    quietStart: typeof dto.quietStart === 'string' ? dto.quietStart : null,
    quietEnd: typeof dto.quietEnd === 'string' ? dto.quietEnd : null,
    timezone: dto.timezone,
  };
}
