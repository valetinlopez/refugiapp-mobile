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

  it('changes the authenticated user password without retrying', async () => {
    const post = jest.spyOn(apiClient, 'post').mockResolvedValue({
      data: undefined,
      headers: { get: () => null },
      requestId: 'request-id',
      status: 204,
    });

    await authApi.changePassword({
      currentPassword: 'old-password',
      newPassword: 'new-password',
    });

    expect(post).toHaveBeenCalledWith(
      '/auth/change-password',
      { currentPassword: 'old-password', newPassword: 'new-password' },
      { retry: 0 }
    );
  });

  it('requests password recovery with a public request and returns the generic message', async () => {
    const post = jest.spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'If an active account exists, recovery instructions will be sent.' },
      headers: { get: () => null },
      requestId: 'request-id',
      status: 202,
    });

    await expect(authApi.requestPasswordReset({ email: 'user@refugiapp.local' })).resolves.toEqual({
      message: 'If an active account exists, recovery instructions will be sent.',
    });
    expect(post).toHaveBeenCalledWith(
      '/auth/password-recovery/request',
      { email: 'user@refugiapp.local' },
      { auth: false, retry: 0 }
    );
  });

  it('confirms password recovery with the single-use token and the new password', async () => {
    const post = jest.spyOn(apiClient, 'post').mockResolvedValue({
      data: undefined,
      headers: { get: () => null },
      requestId: 'request-id',
      status: 204,
    });

    await authApi.confirmPasswordReset({
      token: 'raw-single-use-token',
      newPassword: 'new-password',
    });

    expect(post).toHaveBeenCalledWith(
      '/auth/password-recovery/confirm',
      { token: 'raw-single-use-token', newPassword: 'new-password' },
      { auth: false, retry: 0 }
    );
  });
});
