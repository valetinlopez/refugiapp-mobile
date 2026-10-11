import type { Href } from 'expo-router';

import {
  filterAuthorizedDestinations,
  type Capability,
  type RoleCapabilities,
} from '@/application/authorization';
import type { AppIconName } from '@/components/primitives';

export type HomeAccessId = 'animals' | 'care-tasks' | 'medical-records' | 'expenses';

export interface HomeAccess {
  href: Href;
  icon: AppIconName;
  id: HomeAccessId;
  label: string;
  requiredCapability?: Capability;
}

/**
 * Navigation accesses shown on Inicio (D36 / RFG-169).
 *
 * They replace the previous creation quick actions: the dashboard now routes to
 * the four real destinations of the reference instead of the high flows.
 * `Historia clínica` is gated by `canReadClinicalRecords` (so `shelter_manager`
 * never sees a destination that would answer 403).
 */
export const HOME_ACCESSES: readonly HomeAccess[] = [
  { href: { pathname: '/explore' }, icon: 'paw', id: 'animals', label: 'Animales' },
  { href: { pathname: '/care-tasks' }, icon: 'calendar', id: 'care-tasks', label: 'Cuidados' },
  {
    href: { pathname: '/medical-records' },
    icon: 'medical',
    id: 'medical-records',
    label: 'Historia clínica',
    requiredCapability: 'canReadClinicalRecords',
  },
  { href: { pathname: '/expenses' }, icon: 'money', id: 'expenses', label: 'Gastos' },
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
