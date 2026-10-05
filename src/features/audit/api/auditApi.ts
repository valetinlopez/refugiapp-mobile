import { apiClient, type HttpClient } from '@/core/api';

import type {
  AuditFilters,
  AuditLogResponse,
  AuditLogView,
  PaginatedAuditLogsResponse,
  PaginatedAuditLogsView,
} from '../types';
import { toAuditLogView, toPaginatedAuditLogsView } from '../types';

export const auditApi = {
  async list(
    page = 1,
    limit = 20,
    filters: AuditFilters = {},
    client: HttpClient = apiClient
  ): Promise<PaginatedAuditLogsView> {
    const response = await client.get<PaginatedAuditLogsResponse>('/audit-logs', {
      params: { page, limit, ...filters },
    });
    return toPaginatedAuditLogsView(response.data);
  },

  async detail(id: string, client: HttpClient = apiClient): Promise<AuditLogView> {
    const response = await client.get<AuditLogResponse>(`/audit-logs/${id}`);
    return toAuditLogView(response.data);
  },
};
