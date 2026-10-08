import { apiClient, type HttpClient } from '@/core/api';

import type {
  CreateExpenseRequest,
  ExpenseFilters,
  ExpenseResponse,
  PaginatedExpenses,
  PaginatedExpensesResponse,
} from '../types';
import { toPaginatedExpenses } from '../types';

export const expensesApi = {
  async create(
    data: CreateExpenseRequest,
    client: HttpClient = apiClient
  ): Promise<ExpenseResponse> {
    const response = await client.post<ExpenseResponse>('/expenses', data);
    return response.data;
  },

  async list(
    filters: ExpenseFilters = {},
    page = 1,
    limit = 20,
    client: HttpClient = apiClient
  ): Promise<PaginatedExpenses> {
    const response = await client.get<PaginatedExpensesResponse>('/expenses', {
      params: {
        page,
        limit,
        animalId: filters.animalId,
        category: filters.category,
        from: filters.from,
        to: filters.to,
      },
    });
    return toPaginatedExpenses(response.data);
  },

  async listByAnimal(
    animalId: string,
    page = 1,
    limit = 20,
    client: HttpClient = apiClient
  ): Promise<PaginatedExpenses> {
    const response = await client.get<PaginatedExpensesResponse>(`/animals/${animalId}/expenses`, {
      params: { page, limit },
    });
    return toPaginatedExpenses(response.data);
  },
};
