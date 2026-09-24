import { formatDateTime } from '@/components/patterns';

import type { AnimalHistoryEventType } from '../types';

const EVENT_TYPE_LABELS: Record<AnimalHistoryEventType, string> = {
  intake: 'Ingreso',
  transfer: 'Transferencia',
  status_change: 'Cambio de estado',
  behavior_note: 'Nota de comportamiento',
  adoption: 'Adopción',
  general_note: 'Nota general',
};

export function getAnimalEventTypeLabel(type: AnimalHistoryEventType): string {
  return EVENT_TYPE_LABELS[type];
}

export function formatAnimalEventDate(value: string): string {
  return formatDateTime(value);
}
