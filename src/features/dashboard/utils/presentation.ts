import type { HomePriorityState } from '@/application/home';
import type { AppIconName } from '@/components/primitives';
import type { BadgeTone } from '@/types/design-system';

import type { DashboardAnimalStatus } from '../types';

export interface DashboardStatusPresentation {
  icon: AppIconName;
  label: string;
  tone: BadgeTone;
}

const STATUS_PRESENTATION: Record<DashboardAnimalStatus, DashboardStatusPresentation> = {
  admitted: { label: 'Ingresado', icon: 'info', tone: 'neutral' },
  under_treatment: { label: 'En tratamiento', icon: 'medical', tone: 'info' },
  available_for_adoption: { label: 'Disponible para adopción', icon: 'heart', tone: 'positive' },
  adopted: { label: 'Adoptado', icon: 'check', tone: 'positive' },
  deceased: { label: 'Fallecido', icon: 'paw', tone: 'neutral' },
};

export function getStatusPresentation(status: DashboardAnimalStatus): DashboardStatusPresentation {
  return STATUS_PRESENTATION[status];
}

const HOME_PRIORITY_PRESENTATION: Record<HomePriorityState, DashboardStatusPresentation> = {
  overdue: { icon: 'alert', label: 'Vencida', tone: 'danger' },
  upcoming: { icon: 'clock', label: 'Próxima', tone: 'warning' },
  pending: { icon: 'calendar', label: 'Pendiente', tone: 'default' },
};

export function getHomePriorityPresentation(state: HomePriorityState): DashboardStatusPresentation {
  return HOME_PRIORITY_PRESENTATION[state];
}
