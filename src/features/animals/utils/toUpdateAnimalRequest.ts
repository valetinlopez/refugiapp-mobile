import type { Animal, UpdateAnimalRequest } from '../types';

import type { UpdateAnimalFormValues } from './updateAnimalSchema';

function isUnchanged(initial: string | null, current: string | undefined): boolean {
  return current === undefined ? initial === null : current === initial;
}

function toPatchText(
  initial: string | null,
  current: string | undefined
): { value: string | null; changed: boolean } {
  if (isUnchanged(initial, current)) {
    return { changed: false, value: initial };
  }
  return { changed: true, value: current === undefined ? null : current };
}

export function toUpdateAnimalRequest(
  initial: Animal,
  values: UpdateAnimalFormValues,
  profilePhotoMediaId?: string | null
): UpdateAnimalRequest {
  const patch: UpdateAnimalRequest = {};

  if (values.name !== initial.name) {
    patch.name = values.name;
  }
  if (values.species !== initial.species) {
    patch.species = values.species;
  }
  if (values.sex !== initial.sex) {
    patch.sex = values.sex;
  }
  if (values.intakeDate !== initial.intakeDate) {
    patch.intakeDate = values.intakeDate;
  }

  const breed = toPatchText(initial.breed, values.breed);
  if (breed.changed) {
    patch.breed = breed.value;
  }

  const birthDate = toPatchText(initial.birthDate, values.birthDate);
  if (birthDate.changed) {
    patch.birthDate = birthDate.value;
  }

  if (profilePhotoMediaId !== undefined) {
    patch.profilePhotoMediaId = profilePhotoMediaId;
  }

  return patch;
}

export function hasPatchChanges(patch: UpdateAnimalRequest): boolean {
  return Object.keys(patch).length > 0;
}
