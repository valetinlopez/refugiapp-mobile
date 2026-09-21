import { apiClient } from '@/core/api';
import type { Animal, CreateAnimalRequest, PaginatedResponse } from '../types';

export const animalsApi = {
  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<Animal>> {
    const response = await apiClient.get<PaginatedResponse<Animal>>('/animals', {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id: string): Promise<Animal> {
    const response = await apiClient.get<Animal>(`/animals/${id}`);
    return response.data;
  },

  async create(data: CreateAnimalRequest): Promise<Animal> {
    const response = await apiClient.post<Animal>('/animals', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateAnimalRequest>): Promise<Animal> {
    const response = await apiClient.patch<Animal>(`/animals/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/animals/${id}`);
  },
};
