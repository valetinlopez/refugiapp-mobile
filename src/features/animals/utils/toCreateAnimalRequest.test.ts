import type { CreateAnimalFormValues } from './createAnimalSchema';
import { toCreateAnimalRequest } from './toCreateAnimalRequest';

function createValues(overrides: Partial<CreateAnimalFormValues> = {}): CreateAnimalFormValues {
  return {
    name: 'Luna',
    species: 'dog',
    breed: undefined,
    sex: 'female',
    status: 'admitted',
    intakeDate: '2026-01-10',
    birthDate: undefined,
    ...overrides,
  };
}

describe('toCreateAnimalRequest', () => {
  it('maps form values to the backend DTO without undefined keys', () => {
    expect(toCreateAnimalRequest(createValues())).toEqual({
      name: 'Luna',
      species: 'dog',
      sex: 'female',
      status: 'admitted',
      intakeDate: '2026-01-10',
    });
  });

  it('includes optional fields and the orphan photo id when present', () => {
    expect(
      toCreateAnimalRequest(
        createValues({ breed: 'mixed', birthDate: '2025-06-01' }),
        '3fa85f64-5717-4562-b3fc-2c963f66afa6'
      )
    ).toEqual({
      name: 'Luna',
      species: 'dog',
      breed: 'mixed',
      sex: 'female',
      status: 'admitted',
      intakeDate: '2026-01-10',
      birthDate: '2025-06-01',
      profilePhotoMediaId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    });
  });
});
