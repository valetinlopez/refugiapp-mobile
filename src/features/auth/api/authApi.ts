import { apiClient } from '@/core/api';
import type {
  AuthResponse,
  ChangePasswordRequest,
  ConfirmPasswordResetRequest,
  LoginRequest,
  PasswordResetRequestedResponse,
  RequestPasswordResetRequest,
  User,
} from '../types';

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data, {
      auth: false,
      retry: 0,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post<void>('/auth/logout', { refreshToken }, { auth: false, retry: 0 });
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post<void>('/auth/change-password', data, { retry: 0 });
  },

  async requestPasswordReset(
    data: RequestPasswordResetRequest
  ): Promise<PasswordResetRequestedResponse> {
    const response = await apiClient.post<PasswordResetRequestedResponse>(
      '/auth/password-recovery/request',
      data,
      { auth: false, retry: 0 }
    );
    return response.data;
  },

  async confirmPasswordReset(data: ConfirmPasswordResetRequest): Promise<void> {
    await apiClient.post<void>('/auth/password-recovery/confirm', data, {
      auth: false,
      retry: 0,
    });
  },
};
