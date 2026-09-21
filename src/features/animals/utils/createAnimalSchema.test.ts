import { createAnimalSchema } from './createAnimalSchema';

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(year)}-${month}-${day}`;
}

function shiftDays(base: Date, days: number): string {
  const shifted = new Date(base);
  shifted.setDate(shifted.getDate() + days);
  return toLocalDateString(shifted);
}

describe('createAnimalSchema', () => {
  it('accepts the required fields and applies backend defaults', () => {
    const today = toLocalDateString(new Date());

    const result = createAnimalSchema.safeParse({
      name: '  Luna  ',
      species: 'dog',
      intakeDate: today,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: 'Luna',
        species: 'dog',
        breed: undefined,
        sex: 'unknown',
        status: 'admitted',
        intakeDate: today,
        birthDate: undefined,
      });
    }
  });

  it('rejects an empty name and species in Spanish', () => {
    const result = createAnimalSchema.safeParse({
      name: '   ',
      species: '',
      intakeDate: '2026-01-10',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain('El nombre es obligatorio.');
      expect(messages).toContain('La especie es obligatoria.');
    }
  });

  it('rejects values longer than the backend columns', () => {
    const result = createAnimalSchema.safeParse({
      name: 'a'.repeat(121),
      species: 'b'.repeat(81),
      breed: 'c'.repeat(81),
      intakeDate: '2026-01-10',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain('El nombre no puede superar los 120 caracteres.');
      expect(messages).toContain('La especie no puede superar los 80 caracteres.');
      expect(messages).toContain('La raza no puede superar los 80 caracteres.');
    }
  });

  it('normalizes an empty breed to undefined', () => {
    const result = createAnimalSchema.safeParse({
      name: 'Luna',
      species: 'dog',
      breed: '   ',
      intakeDate: '2026-01-10',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.breed).toBeUndefined();
    }
  });

  it('rejects sex and status values outside the backend enums', () => {
    const result = createAnimalSchema.safeParse({
      name: 'Luna',
      species: 'dog',
      sex: 'other',
      status: 'lost',
      intakeDate: '2026-01-10',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain('El sexo seleccionado no es válido.');
      expect(messages).toContain('El estado seleccionado no es válido.');
    }
  });

  it('rejects a missing, malformed, invalid or future intake date', () => {
    const tomorrow = shiftDays(new Date(), 1);

    for (const intakeDate of ['', '10-01-2026', '2026-02-30', tomorrow]) {
      const result = createAnimalSchema.safeParse({
        name: 'Luna',
        species: 'dog',
        intakeDate,
      });
      expect(result.success).toBe(false);
    }

    const missing = createAnimalSchema.safeParse({
      name: 'Luna',
      species: 'dog',
      intakeDate: '',
    });
    if (!missing.success) {
      expect(missing.error.issues[0]?.message).toBe('La fecha de ingreso es obligatoria.');
    }

    const malformed = createAnimalSchema.safeParse({
      name: 'Luna',
      species: 'dog',
      intakeDate: '10-01-2026',
    });
    if (!malformed.success) {
      expect(malformed.error.issues[0]?.message).toBe(
        'La fecha de ingreso debe tener formato AAAA-MM-DD.'
      );
    }

    const future = createAnimalSchema.safeParse({
      name: 'Luna',
      species: 'dog',
      intakeDate: tomorrow,
    });
    if (!future.success) {
      expect(future.error.issues.map((issue) => issue.message)).toContain(
        'La fecha de ingreso no puede ser futura.'
      );
    }
  });

  it('accepts an optional birthDate on or before the intake date', () => {
    const result = createAnimalSchema.safeParse({
      name: 'Luna',
      species: 'dog',
      intakeDate: '2026-01-10',
      birthDate: '2025-06-01',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.birthDate).toBe('2025-06-01');
    }
  });

  it('rejects a birthDate after the intake date', () => {
    const result = createAnimalSchema.safeParse({
      name: 'Luna',
      species: 'dog',
      intakeDate: '2026-01-10',
      birthDate: '2026-02-01',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        'La fecha de nacimiento no puede ser posterior a la fecha de ingreso.'
      );
    }
  });

  it('rejects a malformed birthDate', () => {
    const result = createAnimalSchema.safeParse({
      name: 'Luna',
      species: 'dog',
      intakeDate: '2026-01-10',
      birthDate: '01/06/2025',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        'La fecha de nacimiento debe tener formato AAAA-MM-DD.'
      );
    }
  });
});
