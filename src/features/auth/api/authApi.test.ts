import { apiClient } from '@/core/api';

import { authApi } from './authApi';

describe('authApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps invalid login credentials outside the refresh flow', async () => {
    const response = {
      accessToken: 'access-token',
      expiresIn: '1d',
      refreshExpiresIn: '30d',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
    };
    const post = jest.spyOn(apiClient, 'post').mockResolvedValue({
      data: response,
      headers: { get: () => null },
      requestId: 'request-id',
      status: 200,
    });

    await expect(
      authApi.login({ email: 'admin@refugiapp.local', password: 'secure-password' })
    ).resolves.toEqual(response);
    expect(post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'admin@refugiapp.local', password: 'secure-password' },
      { auth: false, retry: 0 }
    );
  });

  it('sends the refresh token on best-effort logout', async () => {
    const post = jest.spyOn(apiClient, 'post').mockResolvedValue({
      data: undefined,
      headers: { get: () => null },
      requestId: 'request-id',
      status: 204,
    });

    await authApi.logout('refresh-token');

    expect(post).toHaveBeenCalledWith(
      '/auth/logout',
      { refreshToken: 'refresh-token' },
      { auth: false, retry: 0 }
    );
  });
});
