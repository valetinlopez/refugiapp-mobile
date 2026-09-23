import { createMedicalRecordSchema, updateMedicalRecordSchema } from './medicalRecordSchema';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const VET_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';
const MEDIA_ID = '1b2a3b4c-5d6e-4f80-9a10-b11c12d13e14';
const INTAKE_DATE = '2026-01-10';

describe('createMedicalRecordSchema', () => {
  it('accepts and normalizes a valid create payload', () => {
    expect(
      createMedicalRecordSchema(INTAKE_DATE).parse({
        animalId: ANIMAL_ID,
        recordType: 'consultation',
        title: '  Consulta general  ',
        occurredAt: '2026-09-22T14:30:00-03:00',
        veterinarianId: `  ${VET_ID}  `,
        diagnosis: '  Otitis leve  ',
        treatment: '',
        notes: ' ',
        attachmentMediaIds: [MEDIA_ID],
      })
    ).toEqual({
      animalId: ANIMAL_ID,
      recordType: 'consultation',
      title: 'Consulta general',
      occurredAt: '2026-09-22T14:30:00-03:00',
      veterinarianId: VET_ID,
      diagnosis: 'Otitis leve',
      treatment: undefined,
      notes: undefined,
      attachmentMediaIds: [MEDIA_ID],
    });
  });

  it('rejects invalid animal, record type, title and date values', () => {
    const result = createMedicalRecordSchema(INTAKE_DATE).safeParse({
      animalId: 'invalid',
      recordType: 'surgeryx',
      title: 'x',
      occurredAt: '22/09/2026',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.animalId).toContain('Seleccioná un animal válido.');
      expect(errors.recordType).toContain('El tipo de registro seleccionado no es válido.');
      expect(errors.title).toContain('El título debe tener al menos 3 caracteres.');
      expect(errors.occurredAt).toContain('La fecha y hora debe tener formato ISO 8601.');
    }
  });

  it('rejects a future occurredAt', () => {
    const result = createMedicalRecordSchema(INTAKE_DATE).safeParse({
      animalId: ANIMAL_ID,
      recordType: 'vaccination',
      title: 'Vacuna antirrábica',
      occurredAt: '2999-01-01T00:00:00Z',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.occurredAt).toContain(
        'La fecha y hora no puede ser futura.'
      );
    }
  });

  it('rejects an occurredAt before the animal intake date', () => {
    const result = createMedicalRecordSchema(INTAKE_DATE).safeParse({
      animalId: ANIMAL_ID,
      recordType: 'consultation',
      title: 'Consulta inicial',
      occurredAt: '2025-12-31T10:00:00Z',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.occurredAt).toContain(
        'La fecha y hora no puede ser anterior al ingreso del animal.'
      );
    }
  });

  it('rejects more than 10 attachments', () => {
    const ids = Array.from(
      { length: 11 },
      (_, index) => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`
    );
    const result = createMedicalRecordSchema(INTAKE_DATE).safeParse({
      animalId: ANIMAL_ID,
      recordType: 'other',
      title: 'Registro con adjuntos',
      occurredAt: '2026-09-22T10:00:00Z',
      attachmentMediaIds: ids,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.attachmentMediaIds).toContain(
        'No podés adjuntar más de 10 archivos.'
      );
    }
  });
});

describe('updateMedicalRecordSchema', () => {
  it('accepts an empty optional veterinarian and text fields', () => {
    expect(
      updateMedicalRecordSchema(INTAKE_DATE).parse({
        recordType: 'consultation',
        title: 'Consulta de control',
        occurredAt: '2026-09-22T14:30:00-03:00',
        veterinarianId: '',
        diagnosis: '',
        treatment: '',
        notes: '',
      })
    ).toEqual({
      recordType: 'consultation',
      title: 'Consulta de control',
      occurredAt: '2026-09-22T14:30:00-03:00',
      veterinarianId: undefined,
      diagnosis: undefined,
      treatment: undefined,
      notes: undefined,
    });
  });

  it('keeps cross-field date validation for edits', () => {
    const result = updateMedicalRecordSchema(INTAKE_DATE).safeParse({
      recordType: 'surgery',
      title: 'Cirugía',
      occurredAt: '2999-01-01T00:00:00Z',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.occurredAt).toContain(
        'La fecha y hora no puede ser futura.'
      );
    }
  });
});
