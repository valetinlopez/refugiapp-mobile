import type { Href } from 'expo-router';

import type { AppIconName } from '@/components/primitives';

import { hasCapability, type Capability, type RoleCapabilities } from './capabilities';

export type DashboardActionId = 'new-animal' | 'new-task' | 'new-expense';

export interface DashboardQuickAction {
  capability: Capability;
  href: Href;
  icon: AppIconName;
  id: DashboardActionId;
  label: string;
}

export const QUICK_ACTIONS: readonly DashboardQuickAction[] = [
  {
    capability: 'canEditAnimal',
    href: { pathname: '/animals/new' },
    icon: 'paw',
    id: 'new-animal',
    label: 'Alta animal',
  },
  {
    capability: 'canEditAnimal',
    href: { pathname: '/care-tasks/new' },
    icon: 'calendar',
    id: 'new-task',
    label: 'Nueva tarea',
  },
  {
    capability: 'canManageExpenses',
    href: { pathname: '/expenses/new' },
    icon: 'money',
    id: 'new-expense',
    label: 'Registrar gasto',
  },
];

export function filterQuickActions(
  actions: readonly DashboardQuickAction[],
  capabilities: RoleCapabilities
): DashboardQuickAction[] {
  return actions.filter((action) => hasCapability(capabilities, action.capability));
}
