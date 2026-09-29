import { hasCapability, type Capability, type RoleCapabilities } from './capabilities';

export interface CapabilityProtectedDestination {
  requiredCapability?: Capability;
}

export function filterAuthorizedDestinations<T extends object>(
  destinations: readonly T[],
  capabilities: RoleCapabilities
): T[] {
  return destinations.filter((destination) => {
    const { requiredCapability } = destination as CapabilityProtectedDestination;
    return requiredCapability === undefined || hasCapability(capabilities, requiredCapability);
  });
}
