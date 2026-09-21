import type { Animal } from '../types';

import type { UpdateAnimalFormInput } from './updateAnimalSchema';

export function toUpdateAnimalFormValues(animal: Animal): UpdateAnimalFormInput {
  return {
    name: animal.name,
    species: animal.species,
    breed: animal.breed ?? '',
    sex: animal.sex,
    intakeDate: animal.intakeDate,
    birthDate: animal.birthDate ?? '',
  };
}
