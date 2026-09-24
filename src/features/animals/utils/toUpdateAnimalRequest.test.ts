import type { Animal } from '../types';
import { hasPatchChanges, toUpdateAnimalRequest } from './toUpdateAnimalRequest';
import type { UpdateAnimalFormValues } from './updateAnimalSchema';

const ANIMAL: Animal = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  name: 'Luna',
  species: 'dog',
  breed: 'Mestizo',
  sex: 'female',
  status: 'admitted',
  intakeDate: '2026-01-10',
  birthDate: '2025-06-01',
  profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
};

const FORM: UpdateAnimalFormValues = {
  name: 'Luna',
  species: 'dog',
  breed: 'Mestizo',
  sex: 'female',
  intakeDate: '2026-01-10',
  birthDate: '2025-06-01',
};

describe('toUpdateAnimalRequest', () => {
  it('omits every field when nothing changed', () => {
    const request = toUpdateAnimalRequest(ANIMAL, FORM);
    expect(request).toEqual({});
    expect(hasPatchChanges(request)).toBe(false);
  });

  it('sends null to clear a nullable text field', () => {
    expect(toUpdateAnimalRequest(ANIMAL, { ...FORM, breed: undefined })).toEqual({
      breed: null,
    });
  });

  it('does not send null when the initial value is already null', () => {
    expect(
      toUpdateAnimalRequest({ ...ANIMAL, breed: null }, { ...FORM, breed: undefined })
    ).toEqual({});
  });

  it('sends null to clear the birth date', () => {
    expect(toUpdateAnimalRequest(ANIMAL, { ...FORM, birthDate: undefined })).toEqual({
      birthDate: null,
    });
  });

  it('sends only the changed scalar fields', () => {
    expect(
      toUpdateAnimalRequest(ANIMAL, { ...FORM, name: 'Luna Editada', species: 'cat' })
    ).toEqual({ name: 'Luna Editada', species: 'cat' });
  });

  it('links a new orphan photo when a new media id is uploaded', () => {
    const request = toUpdateAnimalRequest(ANIMAL, FORM, '9fa85f64-5717-4562-b3fc-2c963f66afa6');
    expect(request).toEqual({ profilePhotoMediaId: '9fa85f64-5717-4562-b3fc-2c963f66afa6' });
  });

  it('omits the photo field when keeping the current photo', () => {
    const request = toUpdateAnimalRequest(ANIMAL, FORM);
    expect('profilePhotoMediaId' in request).toBe(false);
  });

  it('reports a patch as changed when it has at least one key', () => {
    const patch = toUpdateAnimalRequest(ANIMAL, { ...FORM, intakeDate: '2026-02-01' });
    expect(hasPatchChanges(patch)).toBe(true);
  });
});
