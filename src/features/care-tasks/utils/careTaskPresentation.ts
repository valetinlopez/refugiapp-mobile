import type { AppIconName } from '@/components/primitives';
import { formatDateTime } from '@/components/patterns';
import type { BadgeTone } from '@/types/design-system';

import type { CareTaskStatus } from '../types';

export function getCareTaskStatusPresentation(
  status: CareTaskStatus,
  dueAt: string | null,
  now = new Date(),
  upcomingWindowHours = 24
): { icon: AppIconName; label: string; tone: BadgeTone } {
  if (status === 'completed') return { icon: 'check', label: 'Completada', tone: 'positive' };
  if (status === 'cancelled') return { icon: 'close', label: 'Cancelada', tone: 'neutral' };
  const dueAtTime = dueAt === null ? Number.NaN : new Date(dueAt).getTime();
  if (dueAtTime < now.getTime()) {
    return { icon: 'alert', label: 'Vencida', tone: 'danger' };
  }
  if (dueAtTime - now.getTime() <= upcomingWindowHours * 60 * 60 * 1000) {
    return { icon: 'clock', label: 'Próxima', tone: 'warning' };
  }
  return { icon: 'clock', label: 'Pendiente', tone: 'warning' };
}

export function formatCareTaskDate(value: string | null): string {
  if (value === null || value === '') return 'Sin fecha';
  return formatDateTime(value) || 'Sin fecha';
}
