import { apiClient, type HttpClient } from '@/core/api';
import type { components } from '@/core/api/generated/openapi';

type CareTaskResponse = components['schemas']['CareTaskResponseDto'];
type PaginatedCareTasksResponse = components['schemas']['PaginatedCareTasksResponseDto'];
type PaginatedExpensesResponse = components['schemas']['PaginatedExpensesResponseDto'];

/**
 * Best-effort size of the priorities window shown on Inicio. It is deliberately
 * small and labelled in the UI: the section never promises the global next-due
 * task, only the most urgent ones inside the loaded page.
 */
export const HOME_PRIORITIES_LIMIT = 10;

export interface HomePriorityTask {
  animalId: string;
  dueAt: string | null;
  id: string;
  title: string;
}

function toHomePriorityTask(dto: CareTaskResponse): HomePriorityTask {
  return {
    animalId: dto.animalId,
    dueAt: typeof dto.dueAt === 'string' ? dto.dueAt : null,
    id: dto.id,
    title: dto.title,
  };
}

function readTotal(total: unknown): number {
  return typeof total === 'number' && Number.isFinite(total) && total >= 0 ? total : 0;
}

/**
 * Read-only summaries for the Inicio dashboard (D36 / RFG-169).
 *
 * Every call consumes an already published contract and only reads what the
 * screen needs: the exact pending-care-task count (`limit=1`, `total`), the
 * pending page used to derive priorities, and the expense record count. No
 * aggregation that the backend does not publish (e.g. a monthly monetary total)
 * is invented here.
 */
export const homeApi = {
  async getPendingCareTaskCount(client: HttpClient = apiClient): Promise<number> {
    const response = await client.get<PaginatedCareTasksResponse>('/care-tasks', {
      params: { limit: 1, page: 1, status: 'pending' },
    });
    return readTotal(response.data.total);
  },

  async listPendingCareTasks(client: HttpClient = apiClient): Promise<HomePriorityTask[]> {
    const response = await client.get<PaginatedCareTasksResponse>('/care-tasks', {
      params: { limit: HOME_PRIORITIES_LIMIT, page: 1, status: 'pending' },
    });
    return response.data.items.map(toHomePriorityTask);
  },

  async getExpenseCount(client: HttpClient = apiClient): Promise<number> {
    const response = await client.get<PaginatedExpensesResponse>('/expenses', {
      params: { limit: 1, page: 1 },
    });
    return readTotal(response.data.total);
  },
};
