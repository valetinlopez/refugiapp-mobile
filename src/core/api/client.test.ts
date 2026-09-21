import type { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { config } from '@/core/config';
import { apiClient } from './client';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const getItemMock = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;

function stubAdapter(): { headers?: Record<string, string> } {
  const captured: { headers?: Record<string, string> } = {};
  apiClient.defaults.adapter = (async (request: InternalAxiosRequestConfig) => {
    captured.headers = request.headers as unknown as Record<string, string>;
    return {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: request,
    };
  }) as never;
  return captured;
}

describe('src/core/api/client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the centralized API base URL', () => {
    expect(apiClient.defaults.baseURL).toBe(config.apiBaseUrl);
  });

  it('attaches the access token as a Bearer header', async () => {
    getItemMock.mockResolvedValueOnce('token-123');
    const captured = stubAdapter();

    await apiClient.get('/animals');

    expect(captured.headers?.Authorization).toBe('Bearer token-123');
  });

  it('does not attach a header when no token is stored', async () => {
    getItemMock.mockResolvedValueOnce(null);
    const captured = stubAdapter();

    await apiClient.get('/animals');

    expect(captured.headers?.Authorization).toBeUndefined();
  });
});
