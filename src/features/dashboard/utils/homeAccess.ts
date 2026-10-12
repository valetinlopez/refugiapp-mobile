import type { Href } from 'expo-router';

import {
  filterAuthorizedDestinations,
  type Capability,
  type RoleCapabilities,
} from '@/application/authorization';
import type { AppIconName } from '@/components/primitives';
import type { ColorToken } from '@/theme';

export type HomeAccessId = 'animals' | 'care-tasks' | 'medical-records' | 'expenses';

export interface HomeAccess {
  href: Href;
  icon: AppIconName;
  id: HomeAccessId;
  label: string;
  requiredCapability?: Capability;
  /** Semantic accent for the circular icon; always paired with icon + text. */
  tone: ColorToken;
}

/**
 * Navigation accesses shown on Inicio (D36 / RFG-169).
 *
 * They replace the previous creation quick actions: the dashboard now routes to
 * the four real destinations of the reference instead of the high flows.
 * `Historia clínica` is gated by `canReadClinicalRecords` (so `shelter_manager`
 * never sees a destination that would answer 403). Each destination carries a
 * semantic accent (`positive` identity, `warning` pending work, `info` clinical,
 * `neutral` secondary) rendered as a circular icon, never as the only signal.
 */
export const HOME_ACCESSES: readonly HomeAccess[] = [
  {
    href: { pathname: '/explore' },
    icon: 'paw',
    id: 'animals',
    label: 'Animales',
    tone: 'positive',
  },
  {
    href: { pathname: '/care-tasks' },
    icon: 'calendar',
    id: 'care-tasks',
    label: 'Cuidados',
    tone: 'warning',
  },
  {
    href: { pathname: '/medical-records' },
    icon: 'medical',
    id: 'medical-records',
    label: 'Historia clínica',
    requiredCapability: 'canReadClinicalRecords',
    tone: 'info',
  },
  {
    href: { pathname: '/expenses' },
    icon: 'money',
    id: 'expenses',
    label: 'Gastos',
    tone: 'neutral',
  },
];

export function filterHomeAccesses(
  accesses: readonly HomeAccess[],
  capabilities: RoleCapabilities
): HomeAccess[] {
  return filterAuthorizedDestinations(accesses, capabilities);
}

export interface HomeAccessSubtitleInputs {
  animalCount: number | undefined;
  expenseCount: number | undefined;
  pendingCareTaskCount: number | undefined;
}

/**
 * Subtitle per access from the real values loaded by the panel. Every metric is
 * a record count published by the contract; the fallback is a neutral prompt so
 * a failed query never renders "NaN" nor invents a number.
 */
export function buildHomeAccessSubtitles({
  animalCount,
  expenseCount,
  pendingCareTaskCount,
}: HomeAccessSubtitleInputs): Record<HomeAccessId, string> {
  return {
    animals: animalCount === undefined ? 'Ver animales' : `${animalCount} registrados`,
    'care-tasks':
      pendingCareTaskCount === undefined ? 'Ver cuidados' : `${pendingCareTaskCount} pendientes`,
    'medical-records': 'Registros clínicos',
    expenses: expenseCount === undefined ? 'Ver gastos' : `${expenseCount} registros`,
  };
}
