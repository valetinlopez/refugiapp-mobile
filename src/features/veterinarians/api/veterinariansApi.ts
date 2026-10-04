import { apiClient, type HttpClient } from '@/core/api';

import type {
  CreateVeterinarianRequest,
  PaginatedVeterinariansResponse,
  UpdateVeterinarianRequest,
  VeterinarianResponse,
} from '../types';

export interface VeterinarianListParams {
  isActive?: boolean;
  licenseNumber?: string;
  limit: number;
  name?: string;
  page: number;
}

export const veterinariansApi = {
  async list(
    params: VeterinarianListParams,
    client: HttpClient = apiClient
  ): Promise<PaginatedVeterinariansResponse> {
    const response = await client.get<PaginatedVeterinariansResponse>('/veterinarians', {
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.name !== undefined ? { name: params.name } : {}),
        ...(params.licenseNumber !== undefined ? { licenseNumber: params.licenseNumber } : {}),
        ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
      },
    });
    return response.data;
  },

  async getById(id: string, client: HttpClient = apiClient): Promise<VeterinarianResponse> {
    const response = await client.get<VeterinarianResponse>(`/veterinarians/${id}`);
    return response.data;
  },

  async create(
    data: CreateVeterinarianRequest,
    client: HttpClient = apiClient
  ): Promise<VeterinarianResponse> {
    const response = await client.post<VeterinarianResponse>('/veterinarians', data);
    return response.data;
  },

  async update(
    id: string,
    data: UpdateVeterinarianRequest,
    client: HttpClient = apiClient
  ): Promise<VeterinarianResponse> {
    const response = await client.patch<VeterinarianResponse>(`/veterinarians/${id}`, data);
    return response.data;
  },

  async deactivate(id: string, client: HttpClient = apiClient): Promise<void> {
    await client.post<void>(`/veterinarians/${id}/deactivate`);
  },

  async reactivate(id: string, client: HttpClient = apiClient): Promise<VeterinarianResponse> {
    const response = await client.post<VeterinarianResponse>(`/veterinarians/${id}/reactivate`);
    return response.data;
  },
};
