import type { CreateAnimalRequest } from '../types';

import type { CreateAnimalFormValues } from './createAnimalSchema';

export function toCreateAnimalRequest(
  values: CreateAnimalFormValues,
  profilePhotoMediaId?: string
): CreateAnimalRequest {
  return {
    name: values.name,
    species: values.species,
    ...(values.breed !== undefined ? { breed: values.breed } : {}),
    sex: values.sex,
    status: values.status,
    intakeDate: values.intakeDate,
    ...(values.birthDate !== undefined ? { birthDate: values.birthDate } : {}),
    ...(profilePhotoMediaId !== undefined ? { profilePhotoMediaId } : {}),
  };
}
