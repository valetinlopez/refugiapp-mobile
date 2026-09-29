import { apiClient, type HttpClient } from '@/core/api';

import type { CreateUserRequest, PaginatedUsers, UserResponse } from '../types';

export const usersApi = {
  async list(page = 1, limit = 20, client: HttpClient = apiClient): Promise<PaginatedUsers> {
    const response = await client.get<PaginatedUsers>('/users', { params: { page, limit } });
    return response.data;
  },

  async create(data: CreateUserRequest, client: HttpClient = apiClient): Promise<UserResponse> {
    const response = await client.post<UserResponse>('/users', data);
    return response.data;
  },

  async activate(id: string, client: HttpClient = apiClient): Promise<UserResponse> {
    const response = await client.post<UserResponse>(`/users/${id}/activate`);
    return response.data;
  },

  async deactivate(id: string, client: HttpClient = apiClient): Promise<void> {
    await client.post<void>(`/users/${id}/deactivate`);
  },
};
