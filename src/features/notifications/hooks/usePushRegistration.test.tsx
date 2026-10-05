import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { createHttpClient } from '@/core/api';
import {
  createFakeHttpTransport,
  type FakeHttpHandler,
  type FakeHttpRequest,
} from '@/core/api/testing/fakeHttpTransport';

import type { PushProvider } from '../utils/pushProvider';
import { clearRegisteredDevice, getRegisteredDevice } from '../utils/registeredDevice';

import { usePushRegistration } from './usePushRegistration';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { eas: { projectId: 'project-id-123' } } } },
}));

jest.mock('expo-device', () => ({ isDevice: true }));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addPushTokenListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { DEFAULT: 3 },
  IosAuthorizationStatus: { PROVISIONAL: 3, EPHEMERAL: 4 },
}));

const DEVICE_RESPONSE = {
  id: 'device-1',
  platform: 'ios',
  timezone: 'America/Argentina/Buenos_Aires',
  tokenSuffix: 'bc123]',
  isActive: true,
  lastSeenAt: '2026-01-01T00:00:00.000Z',
};

function createProvider(overrides: Partial<PushProvider> = {}): PushProvider {
  return {
    isSupported: () => true,
    getPermissionState: async () => 'granted',
    requestPermission: async () => 'granted',
    ensureAndroidChannel: async () => undefined,
    getExpoPushToken: async () => 'ExponentPushToken[abc123]',
    addTokenRotationListener: () => () => undefined,
    ...overrides,
  };
}

function createClient(handler: FakeHttpHandler) {
  return createHttpClient({
    baseUrl: 'https://api.test/api/v1',
    timeoutMs: 1000,
    tokenStore: {
      getTokens: async () => null,
      setTokens: async () => undefined,
      clearTokens: async () => undefined,
    },
    transport: createFakeHttpTransport({
      'POST /api/v1/notifications/devices': handler,
    }),
  });
}

describe('usePushRegistration', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    clearRegisteredDevice();
    jest.replaceProperty(Platform, 'OS', 'ios');
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false, gcTime: 0 },
        queries: { retry: false, gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('registers the device once and exposes the registered status', async () => {
    const register = jest.fn(async (_request: FakeHttpRequest) => ({
      status: 201,
      body: DEVICE_RESPONSE,
    }));
    const client = createClient(register);
    const { result } = await renderHook(
      () =>
        usePushRegistration({ client, enabled: true, provider: createProvider(), userId: 'u1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.status).toBe('registered'));
    expect(register).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(register.mock.calls[0]?.[0].body));
    expect(body).toMatchObject({
      expoPushToken: 'ExponentPushToken[abc123]',
      platform: 'ios',
      timezone: expect.any(String),
      appVersion: expect.any(String),
    });
    expect(getRegisteredDevice()?.deviceId).toBe('device-1');
  });

  it('does not re-register the same token for the same user', async () => {
    const register = jest.fn(async () => ({ status: 201, body: DEVICE_RESPONSE }));
    const client = createClient(register);
    const { result } = await renderHook(
      () =>
        usePushRegistration({ client, enabled: true, provider: createProvider(), userId: 'u1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.status).toBe('registered'));
    result.current.retry();
    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
  });

  it('reports unavailable when the platform cannot provide push tokens', async () => {
    const { result } = await renderHook(
      () =>
        usePushRegistration({
          enabled: true,
          provider: createProvider({ isSupported: () => false }),
          userId: 'u1',
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.status).toBe('unavailable'));
  });

  it('maps a backend token error to a safe message', async () => {
    const register = jest.fn(async () => ({
      status: 400,
      body: { code: 'INVALID_PUSH_TOKEN' },
    }));
    const client = createClient(register);
    const { result } = await renderHook(
      () =>
        usePushRegistration({ client, enabled: true, provider: createProvider(), userId: 'u1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.errorMessage).toMatch(/token/i);
  });
});
