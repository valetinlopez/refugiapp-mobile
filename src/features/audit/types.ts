import type { components } from '@/core/api/generated/openapi';

export type AuditLog = components['schemas']['AuditLogResponseDto'];
export type PaginatedAuditLogs = components['schemas']['PaginatedAuditLogsResponseDto'];
export type AuditAction = AuditLog['action'];

export interface AuditFilters {
  action?: AuditAction;
  from?: string;
  to?: string;
}
