import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { resolveCareTaskId } from '../utils/notificationNavigation';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function redirectToCareTask(response: Notifications.NotificationResponse | null): void {
  if (response === null) {
    return;
  }
  const careTaskId = resolveCareTaskId(response.notification.request.content.data);
  if (careTaskId === null) {
    return;
  }
  Notifications.clearLastNotificationResponse();
  router.push({ pathname: '/care-tasks/[id]', params: { id: careTaskId } });
}

/**
 * Opens the care task referenced by a notification tap, both on cold start
 * (last response) and while the app is running. Navigation is validated: the
 * payload must carry a UUID and the hook is only mounted inside the
 * authenticated area, so an unauthenticated session never navigates.
 */
export function useNotificationObserver(): void {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    redirectToCareTask(Notifications.getLastNotificationResponse());

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirectToCareTask(response);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
