import { apiClient, type HttpClient } from '@/core/api';
import type { components } from '@/core/api/generated/openapi';

import type { AnimalOption, CreateExpenseRequest, ExpenseResponse } from '../types';

type PaginatedAnimals = components['schemas']['PaginatedAnimalsResponseDto'];

export const expensesApi = {
  async create(
    data: CreateExpenseRequest,
    client: HttpClient = apiClient
  ): Promise<ExpenseResponse> {
    const response = await client.post<ExpenseResponse>('/expenses', data);
    return response.data;
  },

  async listAnimalOptions(client: HttpClient = apiClient): Promise<AnimalOption[]> {
    const response = await client.get<PaginatedAnimals>('/animals', {
      params: { page: 1, limit: 100, sortBy: 'name', sortOrder: 'ASC' },
    });
    return response.data.items.map(({ id, name }) => ({ id, name }));
  },
};
