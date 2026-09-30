import { formatDateTime, parseDateOnly, toLocalDateTimeIso } from '@/components/patterns';
import { ApiError } from '@/core/api';

import type { AuditAction, AuditFilters } from '../types';

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
  'access.denied',
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
  'access.denied': 'Acceso denegado',
};

const SENSITIVE_KEY = /(password|token|secret|authorization|credential|api.?key)/i;

export function auditActionLabel(action: AuditAction): string {
  return ACTION_LABELS[action];
}

export function formatAuditDate(value: string): string {
  return formatDateTime(value) || 'Fecha no disponible';
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

export function buildAuditFilters(action: AuditAction | undefined, from: string, to: string) {
  const filters: AuditFilters = action ? { action } : {};
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
