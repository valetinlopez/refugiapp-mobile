export const notificationKeys = {
  all: ['notifications'] as const,
  permission: () => [...notificationKeys.all, 'permission'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};
