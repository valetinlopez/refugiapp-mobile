import { apiClient, type HttpClient } from '@/core/api';

import type {
  DeviceSubscriptionResponse,
  NotificationPreferenceResponse,
  NotificationPreferences,
  RegisterDeviceRequest,
  UpdateNotificationPreferencesRequest,
} from '../types';
import { toNotificationPreferences } from '../types';

export const notificationsApi = {
  async registerDevice(
    body: RegisterDeviceRequest,
    client: HttpClient = apiClient
  ): Promise<DeviceSubscriptionResponse> {
    const response = await client.post<DeviceSubscriptionResponse>('/notifications/devices', body);
    return response.data;
  },

  async listMyDevices(client: HttpClient = apiClient): Promise<DeviceSubscriptionResponse[]> {
    const response = await client.get<DeviceSubscriptionResponse[]>('/notifications/devices/me');
    return response.data;
  },

  async removeDevice(id: string, client: HttpClient = apiClient): Promise<void> {
    await client.delete<undefined>(`/notifications/devices/${id}`);
  },

  async getPreferences(client: HttpClient = apiClient): Promise<NotificationPreferences> {
    const response = await client.get<NotificationPreferenceResponse>(
      '/notifications/preferences/me'
    );
    return toNotificationPreferences(response.data);
  },

  async updatePreferences(
    body: UpdateNotificationPreferencesRequest,
    client: HttpClient = apiClient
  ): Promise<NotificationPreferences> {
    const response = await client.put<NotificationPreferenceResponse>(
      '/notifications/preferences/me',
      body
    );
    return toNotificationPreferences(response.data);
  },
};
