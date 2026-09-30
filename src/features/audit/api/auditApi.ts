import { apiClient, type HttpClient } from '@/core/api';

import type { AuditFilters, AuditLog, PaginatedAuditLogs } from '../types';

export const auditApi = {
  async list(
    page = 1,
    limit = 20,
    filters: AuditFilters = {},
    client: HttpClient = apiClient
  ): Promise<PaginatedAuditLogs> {
    const response = await client.get<PaginatedAuditLogs>('/audit-logs', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  async detail(id: string, client: HttpClient = apiClient): Promise<AuditLog> {
    const response = await client.get<AuditLog>(`/audit-logs/${id}`);
    return response.data;
  },
};
