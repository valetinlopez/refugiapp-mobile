import type { BadgeTone } from '@/types/design-system';

import type { CareTaskStatus } from '../types';

export function getCareTaskStatusPresentation(
  status: CareTaskStatus,
  dueAt: string | null,
  now = new Date()
): { label: string; tone: BadgeTone } {
  if (status === 'completed') return { label: 'Completada', tone: 'positive' };
  if (status === 'cancelled') return { label: 'Cancelada', tone: 'neutral' };
  if (dueAt !== null && new Date(dueAt).getTime() < now.getTime()) {
    return { label: 'Vencida', tone: 'danger' };
  }
  return { label: 'Pendiente', tone: 'warning' };
}

export function formatCareTaskDate(value: string | null): string {
  if (value === null) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
