import { capabilitiesForRoles } from '@/application/authorization';

import { buildHomeAccessSubtitles, filterHomeAccesses, HOME_ACCESSES } from './homeAccess';

describe('HOME_ACCESSES (D36 / RFG-169)', () => {
  it('declares the four reference destinations in canonical order', () => {
    expect(HOME_ACCESSES.map((access) => access.id)).toEqual([
      'animals',
      'care-tasks',
      'medical-records',
      'expenses',
    ]);
  });

  it('gates only Historia clínica behind canReadClinicalRecords', () => {
    const gated = HOME_ACCESSES.filter((access) => access.requiredCapability !== undefined);
    expect(gated.map((access) => access.id)).toEqual(['medical-records']);
    expect(gated[0]?.requiredCapability).toBe('canReadClinicalRecords');
  });

  it('keeps every destination navigable for all roles except the clinical gate', () => {
    expect(
      filterHomeAccesses(HOME_ACCESSES, capabilitiesForRoles(['admin'])).map((a) => a.id)
    ).toEqual(['animals', 'care-tasks', 'medical-records', 'expenses']);

    expect(
      filterHomeAccesses(HOME_ACCESSES, capabilitiesForRoles(['veterinarian'])).map((a) => a.id)
    ).toEqual(['animals', 'care-tasks', 'medical-records', 'expenses']);

    expect(
      filterHomeAccesses(HOME_ACCESSES, capabilitiesForRoles(['shelter_manager'])).map((a) => a.id)
    ).toEqual(['animals', 'care-tasks', 'expenses']);
  });
});

describe('buildHomeAccessSubtitles (D36 / RFG-169)', () => {
  it('uses the real record counts when available', () => {
    expect(
      buildHomeAccessSubtitles({
        animalCount: 48,
        expenseCount: 12,
        pendingCareTaskCount: 6,
      })
    ).toEqual({
      animals: '48 registrados',
      'care-tasks': '6 pendientes',
      'medical-records': 'Registros clínicos',
      expenses: '12 registros',
    });
  });

  it('falls back to a neutral prompt instead of NaN when a count did not load', () => {
    expect(
      buildHomeAccessSubtitles({
        animalCount: undefined,
        expenseCount: undefined,
        pendingCareTaskCount: undefined,
      })
    ).toEqual({
      animals: 'Ver animales',
      'care-tasks': 'Ver cuidados',
      'medical-records': 'Registros clínicos',
      expenses: 'Ver gastos',
    });
  });
});
