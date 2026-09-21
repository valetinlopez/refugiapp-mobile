import type { AppIconName } from '@/components/primitives';
import type { BadgeTone } from '@/types/design-system';

import type { AnimalStatus } from '../types';

export const ANIMAL_STATUS_ORDER: AnimalStatus[] = [
  'admitted',
  'under_treatment',
  'available_for_adoption',
  'adopted',
  'deceased',
] as const;

const TERMINAL_STATUSES: ReadonlySet<AnimalStatus> = new Set(['adopted', 'deceased']);

const ALLOWED_TRANSITIONS: Record<AnimalStatus, AnimalStatus[]> = {
  admitted: ['under_treatment', 'available_for_adoption', 'deceased'],
  under_treatment: ['admitted', 'available_for_adoption', 'deceased'],
  available_for_adoption: ['under_treatment', 'adopted', 'deceased'],
  adopted: [],
  deceased: [],
};

export function isTerminalStatus(status: AnimalStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function getAllowedTransitions(status: AnimalStatus): AnimalStatus[] {
  return ALLOWED_TRANSITIONS[status];
}

interface StatusPresentation {
  badgeIcon: AppIconName;
  consequence: string;
  label: string;
  tone: BadgeTone;
}

const STATUS_PRESENTATION: Record<AnimalStatus, StatusPresentation> = {
  admitted: {
    label: 'Ingresado',
    badgeIcon: 'info',
    tone: 'neutral',
    consequence: 'El animal pasa a estado de ingreso general.',
  },
  under_treatment: {
    label: 'En tratamiento',
    badgeIcon: 'medical',
    tone: 'info',
    consequence:
      'El animal queda registrado bajo tratamiento. Solo el equipo clínico gestiona su historia.',
  },
  available_for_adoption: {
    label: 'Disponible para adopción',
    badgeIcon: 'heart',
    tone: 'positive',
    consequence: 'El animal pasa a estar visible para adopción.',
  },
  adopted: {
    label: 'Adoptado',
    badgeIcon: 'check',
    tone: 'positive',
    consequence:
      'Es un estado final e irreversible: el animal queda marcado como adoptado y ya no admite cambios.',
  },
  deceased: {
    label: 'Fallecido',
    badgeIcon: 'paw',
    tone: 'neutral',
    consequence:
      'Es un estado final e irreversible. El animal queda registrado como fallecido con respeto en su historial.',
  },
};

export function getStatusLabel(status: AnimalStatus): string {
  return STATUS_PRESENTATION[status].label;
}

export function getStatusBadge(status: AnimalStatus): {
  icon: AppIconName;
  label: string;
  tone: BadgeTone;
} {
  return {
    icon: STATUS_PRESENTATION[status].badgeIcon,
    label: STATUS_PRESENTATION[status].label,
    tone: STATUS_PRESENTATION[status].tone,
  };
}

export function getStatusConsequence(status: AnimalStatus): string {
  return STATUS_PRESENTATION[status].consequence;
}
