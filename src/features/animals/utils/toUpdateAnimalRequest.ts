import type { UpdateAnimalRequest } from '../types';

import type { UpdateAnimalFormValues } from './updateAnimalSchema';

export function toUpdateAnimalRequest(
  values: UpdateAnimalFormValues,
  profilePhotoMediaId?: string | null
): UpdateAnimalRequest {
  return {
    name: values.name,
    species: values.species,
    ...(values.breed !== undefined ? { breed: values.breed } : {}),
    sex: values.sex,
    intakeDate: values.intakeDate,
    ...(values.birthDate !== undefined ? { birthDate: values.birthDate } : {}),
    ...(profilePhotoMediaId !== undefined ? { profilePhotoMediaId } : {}),
  };
}
