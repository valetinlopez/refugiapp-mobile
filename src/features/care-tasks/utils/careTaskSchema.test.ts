import { createCareTaskSchema, updateCareTaskSchema } from './careTaskSchema';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('care task schemas', () => {
  it('accepts and normalizes a valid create payload', () => {
    expect(
      createCareTaskSchema.parse({
        animalId: ANIMAL_ID,
        title: '  Dar medicación  ',
        description: '  Una dosis  ',
        dueAt: '2026-09-22T18:00:00-03:00',
      })
    ).toEqual({
      animalId: ANIMAL_ID,
      title: 'Dar medicación',
      description: 'Una dosis',
      dueAt: '2026-09-22T18:00:00-03:00',
    });
  });

  it('rejects invalid animal, title and date values', () => {
    const result = createCareTaskSchema.safeParse({
      animalId: 'invalid',
      title: 'x',
      description: '',
      dueAt: '22/09/2026',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.animalId).toContain('Seleccioná un animal válido.');
      expect(errors.title).toContain('El título debe tener al menos 3 caracteres.');
      expect(errors.dueAt).toContain('La fecha y hora debe tener formato ISO 8601.');
    }
  });

  it('supports clearing optional edit fields', () => {
    expect(
      updateCareTaskSchema.parse({ title: 'Control general', description: '', dueAt: '' })
    ).toEqual({ title: 'Control general', description: undefined, dueAt: undefined });
  });
});
