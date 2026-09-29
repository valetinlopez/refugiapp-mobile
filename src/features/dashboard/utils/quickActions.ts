import type { Href } from 'expo-router';

import type { AppIconName } from '@/components/primitives';
import {
  filterAuthorizedDestinations,
  type Capability,
  type RoleCapabilities,
} from '@/application/authorization';

export type DashboardActionId = 'new-animal' | 'new-task' | 'new-expense' | 'manage-users';

export interface DashboardQuickAction {
  requiredCapability: Capability;
  href: Href;
  icon: AppIconName;
  id: DashboardActionId;
  label: string;
}

export const QUICK_ACTIONS: readonly DashboardQuickAction[] = [
  {
    requiredCapability: 'canEditAnimal',
    href: { pathname: '/animals/new' },
    icon: 'paw',
    id: 'new-animal',
    label: 'Alta animal',
  },
  {
    requiredCapability: 'canEditAnimal',
    href: { pathname: '/care-tasks/new' },
    icon: 'calendar',
    id: 'new-task',
    label: 'Nueva tarea',
  },
  {
    requiredCapability: 'canManageExpenses',
    href: { pathname: '/expenses/new' },
    icon: 'money',
    id: 'new-expense',
    label: 'Registrar gasto',
  },
  {
    requiredCapability: 'canManageUsers',
    href: '/users' as Href,
    icon: 'account',
    id: 'manage-users',
    label: 'Gestionar usuarios',
  },
];

export function filterQuickActions(
  actions: readonly DashboardQuickAction[],
  capabilities: RoleCapabilities
): DashboardQuickAction[] {
  return filterAuthorizedDestinations(actions, capabilities);
}
