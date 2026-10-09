import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import {
  isExpoGo,
  loadNotificationsModule,
  type LoadNotificationsModule,
  type NotificationsModule,
} from '../utils/pushProvider';
import { resolveCareTaskId } from '../utils/notificationNavigation';

interface NotificationResponseShape {
  notification: {
    request: {
      content: { data?: unknown };
    };
  };
}

function redirectToCareTask(
  notifications: NotificationsModule,
  response: NotificationResponseShape | null
): void {
  if (response === null) {
    return;
  }
  const careTaskId = resolveCareTaskId(response.notification.request.content.data);
  if (careTaskId === null) {
    return;
  }
  try {
    notifications.clearLastNotificationResponse();
  } catch {
    // Unavailable build: navigation already satisfied the tap.
  }
  router.push({ pathname: '/care-tasks/[id]', params: { id: careTaskId } });
}

/**
 * Opens the care task referenced by a notification tap, both on cold start
 * (last response) and while the app is running. Navigation is validated: the
 * payload must carry a UUID and the hook is only mounted inside the
 * authenticated area, so an unauthenticated session never navigates. The push
 * module is loaded lazily so environments where it is unavailable (Expo Go on
 * Android since SDK 53 throws while importing) degrade to a no-op instead of
 * crashing the layout; inside Expo Go the module is never imported.
 */
export function useNotificationObserver(
  loadModule: LoadNotificationsModule = loadNotificationsModule
): void {
  useEffect(() => {
    if (Platform.OS === 'web' || isExpoGo()) {
      return undefined;
    }

    let mounted = true;
    let unsubscribe = () => {};

    void loadModule().then((notifications) => {
      if (!mounted || notifications === null) {
        return;
      }
      try {
        notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        redirectToCareTask(notifications, notifications.getLastNotificationResponse());
        const subscription = notifications.addNotificationResponseReceivedListener((response) => {
          redirectToCareTask(notifications, response);
        });
        unsubscribe = () => subscription.remove();
      } catch {
        // Notifications are unavailable on this build; navigation is a no-op.
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [loadModule]);
}
