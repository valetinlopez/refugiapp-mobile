import { apiClient } from '@/core/api';
import type { AuthResponse, LoginRequest, User } from '../types';

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
};
