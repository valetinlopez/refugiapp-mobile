import { apiClient, type HttpClient } from '@/core/api';

import type {
  CreateExpenseRequest,
  ExpenseDetail,
  ExpenseFilters,
  ExpenseResponse,
  PaginatedExpenses,
  PaginatedExpensesResponse,
} from '../types';
import { toExpenseDetail, toPaginatedExpenses } from '../types';

export const expensesApi = {
  async create(
    data: CreateExpenseRequest,
    client: HttpClient = apiClient
  ): Promise<ExpenseResponse> {
    const response = await client.post<ExpenseResponse>('/expenses', data);
    return response.data;
  },

  async getById(id: string, client: HttpClient = apiClient): Promise<ExpenseDetail> {
    const response = await client.get<ExpenseResponse>(`/expenses/${id}`);
    return toExpenseDetail(response.data);
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

  async remove(id: string, client: HttpClient = apiClient): Promise<void> {
    await client.delete<void>(`/expenses/${id}`);
  },
};
