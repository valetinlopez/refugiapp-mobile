import {
  formatDateTime,
  formatRelativeDateTime,
  parseDateOnly,
  toLocalDateTimeIso,
} from '@/components/patterns';
import type { AppIconName } from '@/components/primitives';
import { ApiError } from '@/core/api';
import { isUuid } from '@/core/validation';

import type { AuditAction, AuditFilters, AuditResourceType } from '../types';

export const AUDIT_ACTIONS: readonly AuditAction[] = [
  'user.create',
  'user.deactivate',
  'user.activate',
  'user.role_assign',
  'medical_record.create',
  'medical_record.update',
  'medical_record.soft_delete',
  'medical_record.restore',
  'expense.create',
  'expense.soft_delete',
  'care_task.create',
  'care_task.update',
  'care_task.complete',
  'care_task.cancel',
  'auth.login_success',
  'auth.login_failure',
  'auth.refresh_success',
  'auth.refresh_failure',
  'auth.password_change',
  'auth.password_reset_requested',
  'auth.password_reset_completed',
  'auth.password_reset_failed',
  'access.denied',
  'push.device_register',
  'push.device_remove',
  'push.preferences_update',
  'push.dispatch_completed',
  'push.token_invalid',
  'adopter.create',
  'adoption_application.create',
  'adoption.complete',
];

const ACTION_LABELS: Record<AuditAction, string> = {
  'user.create': 'Usuario creado',
  'user.deactivate': 'Usuario desactivado',
  'user.activate': 'Usuario activado',
  'user.role_assign': 'Rol asignado',
  'medical_record.create': 'Registro clínico creado',
  'medical_record.update': 'Registro clínico actualizado',
  'medical_record.soft_delete': 'Registro clínico eliminado',
  'medical_record.restore': 'Registro clínico restaurado',
  'expense.create': 'Gasto creado',
  'expense.soft_delete': 'Gasto eliminado',
  'care_task.create': 'Tarea creada',
  'care_task.update': 'Tarea actualizada',
  'care_task.complete': 'Tarea completada',
  'care_task.cancel': 'Tarea cancelada',
  'auth.login_success': 'Inicio de sesión exitoso',
  'auth.login_failure': 'Inicio de sesión fallido',
  'auth.refresh_success': 'Sesión renovada',
  'auth.refresh_failure': 'Renovación fallida',
  'auth.password_change': 'Contraseña cambiada',
  'auth.password_reset_requested': 'Recuperación de contraseña solicitada',
  'auth.password_reset_completed': 'Recuperación de contraseña completada',
  'auth.password_reset_failed': 'Recuperación de contraseña fallida',
  'access.denied': 'Acceso denegado',
  'push.device_register': 'Dispositivo registrado para notificaciones',
  'push.device_remove': 'Dispositivo eliminado de notificaciones',
  'push.preferences_update': 'Preferencias de notificación actualizadas',
  'push.dispatch_completed': 'Notificación enviada',
  'push.token_invalid': 'Token de notificación inválido',
  'adopter.create': 'Adoptante registrado',
  'adoption_application.create': 'Postulación de adopción creada',
  'adoption.complete': 'Adopción completada',
};

export const AUDIT_RESOURCE_TYPES: readonly AuditResourceType[] = [
  'user',
  'medical_record',
  'expense',
  'care_task',
  'auth_session',
  'authorization',
  'notification',
  'adopter',
  'adoption_application',
  'adoption',
];

const RESOURCE_TYPE_LABELS: Record<AuditResourceType, string> = {
  user: 'Usuario',
  medical_record: 'Registro clínico',
  expense: 'Gasto',
  care_task: 'Tarea',
  auth_session: 'Sesión',
  authorization: 'Autorización',
  notification: 'Notificación',
  adopter: 'Adoptante',
  adoption_application: 'Postulación de adopción',
  adoption: 'Adopción',
};

const RESOURCE_TYPE_ICONS: Record<AuditResourceType, AppIconName> = {
  user: 'account',
  medical_record: 'medical',
  expense: 'money',
  care_task: 'document',
  auth_session: 'logout',
  authorization: 'alert',
  notification: 'info',
  adopter: 'account',
  adoption_application: 'document',
  adoption: 'heart',
};

const SENSITIVE_KEY = /(password|token|secret|authorization|credential|api.?key)/i;

const METADATA_KEY_LABELS: Record<string, string> = {
  result: 'Resultado',
  outcome: 'Resultado',
  status: 'Estado',
  reason: 'Motivo',
  origin: 'Origen',
  source: 'Origen',
  method: 'Método',
  path: 'Ruta',
  email: 'Email',
  roles: 'Roles',
  licenseNumber: 'Matrícula',
  kind: 'Tipo',
  platform: 'Plataforma',
  count: 'Cantidad',
  total: 'Total',
  dedupKey: 'Clave de deduplicación',
  correlationId: 'ID de correlación',
  correlation_id: 'ID de correlación',
  resourceName: 'Recurso',
  userId: 'Usuario',
  animalId: 'Animal',
};

const COPYABLE_KEY = /(^|_|\.|-)id$|uuid|correlat|dedup|code|ref|key$/i;

export interface AuditMetadataRow {
  key: string;
  label: string;
  value: string;
  copyable: boolean;
}

export function auditCopyAnnouncement(label: string): string {
  return `${label} copiado.`;
}

export const AUDIT_COPY_ERROR_ANNOUNCEMENT = 'No pudimos copiar. Intentá nuevamente.';

export function auditActionLabel(action: AuditAction): string {
  return ACTION_LABELS[action];
}

export function auditResourceTypeLabel(resourceType: AuditResourceType): string {
  return RESOURCE_TYPE_LABELS[resourceType];
}

export function auditResourceIcon(resourceType: AuditResourceType): AppIconName {
  return RESOURCE_TYPE_ICONS[resourceType];
}

export function auditActionTone(action: AuditAction): 'info' | 'danger' {
  return isHighRiskAuditAction(action) ? 'danger' : 'info';
}

export function isHighRiskAuditAction(action: AuditAction): boolean {
  return (
    action === 'access.denied' ||
    action === 'auth.login_failure' ||
    action === 'auth.refresh_failure' ||
    action === 'auth.password_reset_failed'
  );
}

export function formatAuditIdentifier(value: string | null): string {
  if (!value) return 'Sin identificador';
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}

export function formatAuditDate(value: string): string {
  return formatDateTime(value) || 'Fecha no disponible';
}

export function formatAuditDateBoth(value: string): string {
  const absolute = formatDateTime(value);
  if (!absolute) return 'Fecha no disponible';
  const relative = formatRelativeDateTime(value);
  return relative ? `${relative} · ${absolute}` : absolute;
}

export function sanitizeAuditMetadata(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeAuditMetadata);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !SENSITIVE_KEY.test(key))
      .map(([key, nested]) => [key, sanitizeAuditMetadata(nested)])
  );
}

function humanizeMetadataKey(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
  return spaced === '' ? key : spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatAuditMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return 'No disponible';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'string') return value.trim() === '' ? 'No disponible' : value;
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  return '';
}

/**
 * Turns already-sanitized metadata into friendly label/value rows. Only scalar
 * values become rows; nested objects and arrays stay in the technical JSON view
 * so unknown shapes keep a safe, readable presentation. The caller must pass
 * sanitized metadata (or use `sanitizeAuditMetadata` first).
 */
export function buildAuditMetadataRows(metadata: unknown): AuditMetadataRow[] {
  if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) return [];
  const rows: AuditMetadataRow[] = [];
  for (const [key, rawValue] of Object.entries(metadata as Record<string, unknown>)) {
    if (rawValue !== null && typeof rawValue === 'object') continue;
    const value = formatAuditMetadataValue(rawValue);
    if (value === '') continue;
    rows.push({
      key,
      label: METADATA_KEY_LABELS[key] ?? humanizeMetadataKey(key),
      value,
      copyable: COPYABLE_KEY.test(key) || isUuid(String(rawValue ?? '')),
    });
  }
  return rows;
}

/** Pretty JSON of the sanitized metadata, or an empty string when there is nothing to show. */
export function formatAuditMetadataJson(metadata: unknown): string {
  const sanitized = sanitizeAuditMetadata(metadata);
  const isEmpty =
    sanitized === null ||
    typeof sanitized !== 'object' ||
    Object.keys(sanitized as Record<string, unknown>).length === 0;
  return isEmpty ? '' : JSON.stringify(sanitized, null, 2);
}

export function buildAuditFilters(
  action: AuditAction | undefined,
  resourceType: AuditResourceType | undefined,
  actorUserId: string,
  resourceId: string,
  from: string,
  to: string
) {
  const filters: AuditFilters = {
    ...(action ? { action } : {}),
    ...(resourceType ? { resourceType } : {}),
  };
  if (actorUserId.trim() !== '' && isUuid(actorUserId.trim())) {
    filters.actorUserId = actorUserId.trim();
  }
  if (resourceId.trim() !== '' && isUuid(resourceId.trim())) {
    filters.resourceId = resourceId.trim();
  }
  if (!from || !to || parseDateOnly(from).getTime() > parseDateOnly(to).getTime()) return filters;
  const fromDate = parseDateOnly(from);
  const toDate = parseDateOnly(to);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 0, 0);
  return { ...filters, from: toLocalDateTimeIso(fromDate), to: toLocalDateTimeIso(toDate) };
}

export function auditRangeError(from: string, to: string): string | null {
  if ((from && !to) || (!from && to)) return 'Definí las dos fechas del período.';
  if (from && to && parseDateOnly(from).getTime() > parseDateOnly(to).getTime()) {
    return 'La fecha desde no puede ser posterior a la fecha hasta.';
  }
  return null;
}

export function toAuditErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 403)
    return 'Solo los administradores pueden consultar la auditoría.';
  if (error instanceof ApiError && error.status === 404)
    return 'El evento de auditoría ya no está disponible.';
  return 'No pudimos cargar la auditoría. Intentá nuevamente.';
}
