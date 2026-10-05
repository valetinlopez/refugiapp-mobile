import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

import { apiClient, type HttpClient } from '@/core/api';
import { config } from '@/core/config';

import { notificationsApi } from '../api/notificationsApi';
import type { PushRegistrationStatus } from '../types';
import { toNotificationErrorMessage } from '../utils/notificationErrorMessages';
import {
  expoPushProvider,
  resolveDevicePlatform,
  resolveProjectId,
  type PushProvider,
} from '../utils/pushProvider';
import { getRegisteredDevice, setRegisteredDevice } from '../utils/registeredDevice';
import { resolveTimezone } from '../utils/timezone';

import { usePushPermission } from './usePushPermission';

export interface UsePushRegistrationOptions {
  client?: HttpClient;
  enabled?: boolean;
  provider?: PushProvider;
  userId?: string | null;
}

export interface UsePushRegistrationResult {
  errorMessage: string | null;
  status: PushRegistrationStatus;
  retry(): void;
}

interface RegistrationOutcome {
  status: 'registered' | 'unavailable';
}

/**
 * Registers (or rotates) the current Expo push token for the authenticated
 * user. It only runs when the session is enabled and the permission is granted,
 * and it is idempotent: the backend upserts by token hash, and the in-memory
 * registry avoids redundant requests within the same session.
 */
export function usePushRegistration({
  client = apiClient,
  enabled = true,
  provider = expoPushProvider,
  userId = null,
}: UsePushRegistrationOptions = {}): UsePushRegistrationResult {
  const { state: permissionState } = usePushPermission(provider);

  const { data, error, isError, isPending, mutate } = useMutation<
    RegistrationOutcome,
    unknown,
    void
  >({
    mutationFn: async (): Promise<RegistrationOutcome> => {
      if (!provider.isSupported()) {
        return { status: 'unavailable' };
      }
      const projectId = resolveProjectId();
      const platform = resolveDevicePlatform();
      if (projectId === null || platform === null) {
        return { status: 'unavailable' };
      }

      await provider.ensureAndroidChannel();
      const expoPushToken = await provider.getExpoPushToken(projectId);

      const current = getRegisteredDevice();
      if (
        current !== null &&
        current.expoPushToken === expoPushToken &&
        (userId === null || current.userId === userId)
      ) {
        return { status: 'registered' };
      }

      const device = await notificationsApi.registerDevice(
        {
          expoPushToken,
          platform,
          timezone: resolveTimezone(),
          appVersion: config.appVersion,
        },
        client
      );
      setRegisteredDevice({
        deviceId: device.id,
        expoPushToken,
        userId: userId ?? '',
      });
      return { status: 'registered' };
    },
  });

  useEffect(() => {
    if (enabled && permissionState === 'granted') {
      mutate();
    }
  }, [enabled, permissionState, mutate]);

  useEffect(() => {
    if (!enabled || permissionState !== 'granted') {
      return undefined;
    }
    return provider.addTokenRotationListener(() => {
      mutate();
    });
  }, [enabled, permissionState, provider, mutate]);

  let status: PushRegistrationStatus = 'idle';
  if (!enabled) {
    status = 'idle';
  } else if (isPending) {
    status = 'registering';
  } else if (isError) {
    status = 'error';
  } else if (data !== undefined) {
    status = data.status;
  }

  return {
    status,
    errorMessage: isError ? toNotificationErrorMessage(error) : null,
    retry: useCallback(() => {
      mutate();
    }, [mutate]),
  };
}
