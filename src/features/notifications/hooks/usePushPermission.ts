import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { PushPermissionState } from '../types';
import { expoPushProvider, type PushProvider } from '../utils/pushProvider';

import { notificationKeys } from './notificationKeys';

export interface UsePushPermissionResult {
  isRequesting: boolean;
  requestPermission(): void;
  state: PushPermissionState;
  isLoading: boolean;
}

export function usePushPermission(
  provider: PushProvider = expoPushProvider
): UsePushPermissionResult {
  const queryClient = useQueryClient();
  const query = useQuery<PushPermissionState>({
    queryKey: notificationKeys.permission(),
    queryFn: () => provider.getPermissionState(),
    staleTime: Infinity,
  });

  const { mutate: requestPermission, isPending: isRequesting } = useMutation({
    mutationFn: () => provider.requestPermission(),
    onSuccess: (state) => {
      queryClient.setQueryData(notificationKeys.permission(), state);
    },
  });

  return {
    isLoading: query.isPending,
    isRequesting,
    requestPermission: useCallback(() => {
      requestPermission();
    }, [requestPermission]),
    state: query.data ?? 'unavailable',
  };
}
