import type { Capability, RoleCapabilities } from '@/application/authorization';
import type { AppIconName } from '@/components/primitives';

export type CapabilityPresentation = {
  capability: Capability;
  icon: AppIconName;
  label: string;
};

const CAPABILITY_PRESENTATION: readonly CapabilityPresentation[] = [
  { capability: 'canEditAnimal', icon: 'paw', label: 'Gestionar animales' },
  {
    capability: 'canReadClinicalRecords',
    icon: 'medical',
    label: 'Consultar historias clínicas',
  },
  { capability: 'canManageUsers', icon: 'account', label: 'Gestionar usuarios internos' },
  { capability: 'canManageExpenses', icon: 'money', label: 'Gestionar gastos' },
  { capability: 'canManageVets', icon: 'medical', label: 'Gestionar veterinarios' },
  { capability: 'canManageAdoptions', icon: 'heart', label: 'Gestionar adopciones' },
  { capability: 'canReadAudit', icon: 'document', label: 'Consultar auditoría' },
] as const;

export function grantedCapabilityPresentation(
  capabilities: RoleCapabilities
): readonly CapabilityPresentation[] {
  return CAPABILITY_PRESENTATION.filter(({ capability }) => capabilities[capability]);
}
