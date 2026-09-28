import { getAnimalDetailCapabilities } from './animalDetailCapabilities';

describe('getAnimalDetailCapabilities', () => {
  it.each([
    ['admin', true, true],
    ['shelter_manager', true, false],
    ['veterinarian', false, true],
  ] as const)('maps %s capabilities', (role, canEditAnimal, canReadClinicalRecords) => {
    expect(getAnimalDetailCapabilities([role])).toEqual({
      canEditAnimal,
      canReadClinicalRecords,
    });
  });
});
