import { apiClient, type HttpClient } from '@/core/api';

import type {
  AnimalOption,
  CareTask,
  CareTaskFilters,
  CareTaskResponse,
  CreateCareTaskRequest,
  PaginatedAnimalOptionsResponse,
  PaginatedCareTasks,
  PaginatedCareTasksResponse,
  UpdateCareTaskRequest,
} from '../types';
import { toCareTask, toPaginatedCareTasks } from '../types';

export const careTasksApi = {
  async list(
    filters: CareTaskFilters = {},
    page = 1,
    limit = 20,
    client: HttpClient = apiClient
  ): Promise<PaginatedCareTasks> {
    const response = await client.get<PaginatedCareTasksResponse>('/care-tasks', {
      params: { page, limit, animalId: filters.animalId, status: filters.status },
    });
    return toPaginatedCareTasks(response.data);
  },

  async getById(id: string, client: HttpClient = apiClient): Promise<CareTask> {
    const response = await client.get<CareTaskResponse>(`/care-tasks/${id}`);
    return toCareTask(response.data);
  },

  async create(data: CreateCareTaskRequest, client: HttpClient = apiClient): Promise<CareTask> {
    const response = await client.post<CareTaskResponse>('/care-tasks', data);
    return toCareTask(response.data);
  },

  async update(
    id: string,
    data: UpdateCareTaskRequest,
    client: HttpClient = apiClient
  ): Promise<CareTask> {
    const response = await client.patch<CareTaskResponse>(`/care-tasks/${id}`, data);
    return toCareTask(response.data);
  },

  async complete(id: string, client: HttpClient = apiClient): Promise<CareTask> {
    const response = await client.post<CareTaskResponse>(`/care-tasks/${id}/complete`);
    return toCareTask(response.data);
  },

  async cancel(id: string, client: HttpClient = apiClient): Promise<CareTask> {
    const response = await client.post<CareTaskResponse>(`/care-tasks/${id}/cancel`);
    return toCareTask(response.data);
  },

  async listAnimalOptions(client: HttpClient = apiClient): Promise<AnimalOption[]> {
    const response = await client.get<PaginatedAnimalOptionsResponse>('/animals', {
      params: { page: 1, limit: 100, sortBy: 'name', sortOrder: 'ASC' },
    });
    return response.data.items.map((animal) => ({ id: animal.id, name: animal.name }));
  },
};
