import { capabilitiesForRoles } from '@/application/authorization';

import { grantedCapabilityPresentation } from './profilePresentation';

describe('profile presentation', () => {
  it('shows only the capabilities granted by the current roles with readable labels', () => {
    expect(
      grantedCapabilityPresentation(capabilitiesForRoles(['shelter_manager'])).map(
        ({ capability, label }) => ({ capability, label })
      )
    ).toEqual([
      { capability: 'canEditAnimal', label: 'Gestionar animales' },
      { capability: 'canManageExpenses', label: 'Gestionar gastos' },
      { capability: 'canManageVets', label: 'Gestionar veterinarios' },
      { capability: 'canManageAdoptions', label: 'Gestionar adopciones' },
    ]);
  });

  it('does not expose capability enum values as labels', () => {
    const entries = grantedCapabilityPresentation(capabilitiesForRoles(['admin']));

    expect(entries).toHaveLength(7);
    entries.forEach(({ capability, label }) => expect(label).not.toBe(capability));
  });
});
