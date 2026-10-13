import { formatDateTime, formatRelativeDateTime } from '@/components/patterns';
import type { AppIconName } from '@/components/primitives';
import type { ColorToken } from '@/theme';

import type { AnimalHistoryEvent, AnimalHistoryEventType } from '../types';
import { HISTORY_MISSING_VALUE_LABEL, humanizeHistoryDescription } from './humanizeStatusChange';

const EVENT_TYPE_LABELS: Record<AnimalHistoryEventType, string> = {
  intake: 'Ingreso',
  transfer: 'Transferencia',
  status_change: 'Cambio de estado',
  behavior_note: 'Nota de comportamiento',
  adoption: 'Adopción',
  general_note: 'Nota general',
};

export const ANIMAL_HISTORY_EVENT_TYPES = Object.keys(
  EVENT_TYPE_LABELS
) as AnimalHistoryEventType[];

const EVENT_TYPE_VISUALS: Record<AnimalHistoryEventType, { icon: AppIconName; tone: ColorToken }> =
  {
    intake: { icon: 'calendar', tone: 'warning' },
    transfer: { icon: 'transport', tone: 'warning' },
    status_change: { icon: 'medical', tone: 'info' },
    behavior_note: { icon: 'document', tone: 'positive' },
    adoption: { icon: 'heart', tone: 'positive' },
    general_note: { icon: 'document', tone: 'neutral' },
  };

export function getAnimalEventTypeLabel(type: AnimalHistoryEventType): string {
  return EVENT_TYPE_LABELS[type];
}

export function getAnimalEventVisual(type: AnimalHistoryEventType) {
  return EVENT_TYPE_VISUALS[type];
}

export function formatAnimalEventDate(value: string): string {
  return formatDateTime(value);
}

export function formatAnimalEventDateLabel(value: string): string {
  const absolute = formatDateTime(value);
  if (absolute === '') return HISTORY_MISSING_VALUE_LABEL;
  const relative = formatRelativeDateTime(value);
  return relative === '' ? absolute : `${relative} · ${absolute}`;
}

export function getAnimalEventDescription(
  event: Pick<AnimalHistoryEvent, 'description' | 'eventType'>
): string {
  return humanizeHistoryDescription(event);
}
