import { formatActorName, getActorInitials } from '@/components/patterns';
import type { components } from '@/core/api/generated/openapi';

export type AuditLogResponse = components['schemas']['AuditLogResponseDto'];
export type PaginatedAuditLogsResponse = components['schemas']['PaginatedAuditLogsResponseDto'];
export type AuditActor = components['schemas']['AuditActorDto'];
export type AuditAction = AuditLogResponse['action'];
export type AuditResourceType = AuditLogResponse['resourceType'];

export interface AuditFilters {
  action?: AuditAction;
  resourceType?: AuditResourceType;
  resourceId?: string;
  actorUserId?: string;
  from?: string;
  to?: string;
}

export interface AuditActorView {
  id: string;
  displayName: string;
  initials: string;
  email: string;
}

export interface AuditLogView {
  id: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string | null;
  occurredAt: string;
  metadata: Record<string, unknown>;
  actor: AuditActorView | null;
  actorFallbackId: string | null;
}

export interface PaginatedAuditLogsView {
  items: AuditLogView[];
  page: number;
  limit: number;
  total: number;
}

export function toAuditActorView(actor: AuditActor): AuditActorView {
  return {
    id: actor.id,
    displayName: formatActorName(actor.firstName, actor.lastName),
    initials: getActorInitials(actor.firstName, actor.lastName),
    email: actor.email,
  };
}

export function toAuditLogView(dto: AuditLogResponse): AuditLogView {
  const actor = dto.actor ?? null;
  return {
    id: dto.id,
    action: dto.action,
    resourceType: dto.resourceType,
    resourceId: typeof dto.resourceId === 'string' ? dto.resourceId : null,
    occurredAt: dto.occurredAt,
    metadata: dto.metadata,
    actor: actor === null ? null : toAuditActorView(actor),
    actorFallbackId: typeof dto.actorUserId === 'string' ? dto.actorUserId : null,
  };
}

export function toPaginatedAuditLogsView(dto: PaginatedAuditLogsResponse): PaginatedAuditLogsView {
  return { ...dto, items: dto.items.map(toAuditLogView) };
}
