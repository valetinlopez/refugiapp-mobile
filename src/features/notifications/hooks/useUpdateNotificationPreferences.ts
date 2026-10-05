import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notificationsApi } from '../api/notificationsApi';
import type { NotificationPreferences, UpdateNotificationPreferencesRequest } from '../types';

import { notificationKeys } from './notificationKeys';

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation<NotificationPreferences, Error, UpdateNotificationPreferencesRequest>({
    mutationFn: (body) => notificationsApi.updatePreferences(body),
    onSuccess: (preferences) => {
      queryClient.setQueryData(notificationKeys.preferences(), preferences);
    },
  });
}
