import {
  filterAuthorizedDestinations,
  type CapabilityProtectedDestination,
  type RoleCapabilities,
} from '@/application/authorization';

export type ManagementDestinationId = 'veterinarians' | 'expenses' | 'users' | 'audit';

export interface ManagementDestination extends CapabilityProtectedDestination {
  id: ManagementDestinationId;
  path: string;
}

export const MANAGEMENT_DESTINATIONS = [
  { id: 'veterinarians', path: '/veterinarians' },
  { id: 'expenses', path: '/expenses' },
  { id: 'users', path: '/users', requiredCapability: 'canManageUsers' },
  { id: 'audit', path: '/audit', requiredCapability: 'canReadAudit' },
] as const satisfies readonly ManagementDestination[];

export function getAuthorizedManagementDestinations(
  capabilities: RoleCapabilities
): ManagementDestination[] {
  return filterAuthorizedDestinations(MANAGEMENT_DESTINATIONS, capabilities);
}
