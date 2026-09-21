import { apiClient, type HttpClient } from '@/core/api';

import type {
  Animal,
  AnimalResponse,
  ChangeAnimalStatusRequest,
  CreateAnimalRequest,
  PaginatedAnimalsResponse,
  UpdateAnimalRequest,
} from '../types';
import { toAnimalView } from '../types';

export const animalsApi = {
  async getAll(
    page = 1,
    limit = 20,
    client: HttpClient = apiClient
  ): Promise<PaginatedAnimalsResponse> {
    const response = await client.get<PaginatedAnimalsResponse>('/animals', {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id: string, client: HttpClient = apiClient): Promise<Animal> {
    const response = await client.get<AnimalResponse>(`/animals/${id}`);
    return toAnimalView(response.data);
  },

  async create(data: CreateAnimalRequest, client: HttpClient = apiClient): Promise<Animal> {
    const response = await client.post<AnimalResponse>('/animals', data);
    return toAnimalView(response.data);
  },

  async update(
    id: string,
    data: UpdateAnimalRequest,
    client: HttpClient = apiClient
  ): Promise<Animal> {
    const response = await client.patch<AnimalResponse>(`/animals/${id}`, data);
    return toAnimalView(response.data);
  },

  async changeStatus(
    id: string,
    data: ChangeAnimalStatusRequest,
    client: HttpClient = apiClient
  ): Promise<Animal> {
    const response = await client.patch<AnimalResponse>(`/animals/${id}/status`, data);
    return toAnimalView(response.data);
  },
};
