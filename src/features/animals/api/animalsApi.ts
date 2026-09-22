import { apiClient, type HttpClient } from '@/core/api';

import type {
  Animal,
  AnimalListFilters,
  AnimalResponse,
  ChangeAnimalStatusRequest,
  CreateAnimalRequest,
  PaginatedAnimals,
  PaginatedAnimalsResponse,
  UpdateAnimalRequest,
} from '../types';
import { toAnimalView, toPaginatedAnimals } from '../types';

export const animalsApi = {
  async getAll(
    filters: AnimalListFilters = {},
    page = 1,
    limit = 20,
    client: HttpClient = apiClient
  ): Promise<PaginatedAnimals> {
    const response = await client.get<PaginatedAnimalsResponse>('/animals', {
      params: {
        page,
        limit,
        status: filters.status,
        species: filters.species,
        sex: filters.sex,
        name: filters.name,
      },
    });
    return toPaginatedAnimals(response.data);
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
