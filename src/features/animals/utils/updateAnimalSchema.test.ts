import { toUpdateAnimalFormValues } from './toUpdateAnimalFormValues';
import { updateAnimalSchema } from './updateAnimalSchema';

describe('updateAnimalSchema', () => {
  it('validates a full edit payload', () => {
    const result = updateAnimalSchema.parse({
      name: 'Luna',
      species: 'dog',
      breed: 'Mestizo',
      sex: 'female',
      intakeDate: '2026-01-10',
      birthDate: '2025-06-01',
    });
    expect(result).toEqual({
      name: 'Luna',
      species: 'dog',
      breed: 'Mestizo',
      sex: 'female',
      intakeDate: '2026-01-10',
      birthDate: '2025-06-01',
    });
  });

  it('rejects a birth date after the intake date', () => {
    const result = updateAnimalSchema.safeParse({
      name: 'Luna',
      species: 'dog',
      sex: 'female',
      intakeDate: '2026-01-10',
      birthDate: '2026-02-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === 'birthDate');
      expect(issue?.message).toBe(
        'La fecha de nacimiento no puede ser posterior a la fecha de ingreso.'
      );
    }
  });

  it('normalizes empty optional text to undefined', () => {
    const result = updateAnimalSchema.parse({
      name: 'Luna',
      species: 'dog',
      breed: '',
      sex: 'unknown',
      intakeDate: '2026-01-10',
      birthDate: '',
    });
    expect(result.breed).toBeUndefined();
    expect(result.birthDate).toBeUndefined();
  });

  it('accepts a birth date equal to the intake date', () => {
    const result = updateAnimalSchema.safeParse({
      name: 'Luna',
      species: 'dog',
      sex: 'female',
      intakeDate: '2026-01-10',
      birthDate: '2026-01-10',
    });
    expect(result.success).toBe(true);
  });

  it('accepts an intake date equal to today', () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const result = updateAnimalSchema.safeParse({
      name: 'Luna',
      species: 'dog',
      sex: 'female',
      intakeDate: today,
    });
    expect(result.success).toBe(true);
  });
});

describe('toUpdateAnimalFormValues', () => {
  it('maps the view model to form defaults, normalizing nulls to empty strings', () => {
    expect(
      toUpdateAnimalFormValues({
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'Luna',
        species: 'dog',
        breed: null,
        sex: 'female',
        status: 'admitted',
        intakeDate: '2026-01-10',
        birthDate: null,
        profilePhotoMediaId: null,
      })
    ).toEqual({
      name: 'Luna',
      species: 'dog',
      breed: '',
      sex: 'female',
      intakeDate: '2026-01-10',
      birthDate: '',
    });
  });
});
