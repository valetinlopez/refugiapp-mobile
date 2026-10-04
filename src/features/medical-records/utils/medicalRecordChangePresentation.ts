import { formatDateTime, parseDateOnly, toLocalDateTimeIso } from '@/components/patterns';
import { ApiError, toApiErrorMessage } from '@/core/api';
import { isUuid } from '@/core/validation';

import type {
  MedicalRecordChange,
  MedicalRecordChangeFilters,
  MedicalRecordChangeType,
} from '../types';

export const MEDICAL_RECORD_CHANGE_TYPES: readonly MedicalRecordChangeType[] = [
  'update',
  'soft_delete',
  'restore',
];

const CHANGE_TYPE_LABELS: Record<MedicalRecordChangeType, string> = {
  update: 'Actualización',
  soft_delete: 'Eliminación',
  restore: 'Restauración',
};

const FIELD_LABELS: Record<string, string> = {
  animalId: 'Animal',
  recordType: 'Tipo de registro',
  title: 'Título',
  occurredAt: 'Fecha y hora',
  veterinarianId: 'Veterinario',
  diagnosis: 'Diagnóstico',
  treatment: 'Tratamiento',
  notes: 'Notas',
  deletedAt: 'Fecha de eliminación',
};

const MAX_INLINE_VALUE_LENGTH = 120;

export function getChangeTypeLabel(type: MedicalRecordChangeType): string {
  return CHANGE_TYPE_LABELS[type];
}

export function getChangeTypeTone(type: MedicalRecordChangeType): 'info' | 'danger' | 'positive' {
  if (type === 'soft_delete') return 'danger';
  if (type === 'restore') return 'positive';
  return 'info';
}

export function getChangeFieldLabel(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field]!;
  const humanized = field
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return humanized.length > 0 ? humanized.charAt(0).toUpperCase() + humanized.slice(1) : field;
}

export function formatChangeDate(value: string): string {
  return formatDateTime(value) || 'Fecha no disponible';
}

export function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined) return 'Sin valor';
  if (typeof value === 'string') return truncateInline(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Sin elementos';
    return truncateInline(value.map((item) => formatChangeValue(item)).join(', '));
  }
  if (typeof value === 'object') {
    try {
      const serialized = JSON.stringify(value);
      return serialized === undefined ? 'Valor no disponible' : truncateInline(serialized);
    } catch {
      return 'Valor no disponible';
    }
  }
  return truncateInline(String(value));
}

export function changeFieldsSummary(change: MedicalRecordChange): string {
  const count = change.changedFields.length;
  if (count === 0) return 'Sin campos registrados';
  const labels = change.changedFields.slice(0, 3).map(getChangeFieldLabel);
  const summary = labels.join(', ');
  return count > 3 ? `${summary} y ${count - 3} más` : summary;
}

export function buildChangeFilters(
  changeType: MedicalRecordChangeType | undefined,
  changedByUserId: string,
  from: string,
  to: string
): MedicalRecordChangeFilters {
  const filters: MedicalRecordChangeFilters = changeType ? { changeType } : {};
  if (changedByUserId.trim() !== '' && isUuid(changedByUserId.trim())) {
    filters.changedByUserId = changedByUserId.trim();
  }
  if (!from || !to || parseDateOnly(from).getTime() > parseDateOnly(to).getTime()) return filters;
  const fromDate = parseDateOnly(from);
  const toDate = parseDateOnly(to);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 0, 0);
  return { ...filters, from: toLocalDateTimeIso(fromDate), to: toLocalDateTimeIso(toDate) };
}

export function changeRangeError(from: string, to: string): string | null {
  if ((from && !to) || (!from && to)) return 'Definí las dos fechas del período.';
  if (from && to && parseDateOnly(from).getTime() > parseDateOnly(to).getTime()) {
    return 'La fecha desde no puede ser posterior a la fecha hasta.';
  }
  return null;
}

export function toChangeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'Tu rol no tiene permiso para consultar el historial clínico.';
    if (error.status === 404) return 'El registro clínico ya no está disponible.';
    if (error.status === 400 || error.status === 422)
      return 'Revisá los filtros del historial e intentá de nuevo.';
  }
  return toApiErrorMessage(error);
}

function truncateInline(value: string): string {
  if (value.length <= MAX_INLINE_VALUE_LENGTH) return value;
  return `${value.slice(0, MAX_INLINE_VALUE_LENGTH).trimEnd()}…`;
}
