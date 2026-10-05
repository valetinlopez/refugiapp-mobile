import { useQuery } from '@tanstack/react-query';

import { notificationsApi } from '../api/notificationsApi';
import type { NotificationPreferences } from '../types';

import { notificationKeys } from './notificationKeys';

export function useNotificationPreferences() {
  return useQuery<NotificationPreferences>({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationsApi.getPreferences(),
    retry: 1,
    staleTime: 60_000,
  });
}
