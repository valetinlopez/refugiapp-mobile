import { localDayStart } from '@/core/validation';

import {
  ANIMAL_EVENT_FUTURE_TOLERANCE_MS,
  createAnimalEventSchema,
  MANUAL_ANIMAL_EVENT_TYPES,
} from './createAnimalEventSchema';

describe('createAnimalEventSchema', () => {
  it.each(MANUAL_ANIMAL_EVENT_TYPES)('accepts the manual event type %s', (eventType) => {
    expect(
      createAnimalEventSchema().safeParse({ eventType, description: 'Novedad del animal.' }).success
    ).toBe(true);
  });

  it.each(['intake', 'status_change', 'adoption'])(
    'rejects the system event type %s',
    (eventType) => {
      const result = createAnimalEventSchema().safeParse({
        eventType,
        description: 'Evento reservado al sistema.',
      });

      expect(result.success).toBe(false);
    }
  );

  it('trims the description and omits an empty occurredAt', () => {
    expect(
      createAnimalEventSchema().parse({
        eventType: 'general_note',
        description: '  Se adaptó correctamente.  ',
        occurredAt: '',
      })
    ).toEqual({
      eventType: 'general_note',
      description: 'Se adaptó correctamente.',
      occurredAt: undefined,
    });
  });

  it('rejects an invalid date and descriptions longer than the contract allows', () => {
    const result = createAnimalEventSchema().safeParse({
      eventType: 'transfer',
      description: 'a'.repeat(1001),
      occurredAt: '21/09/2026 14:30',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.description).toContain(
        'La descripción no puede superar los 1000 caracteres.'
      );
      expect(result.error.flatten().fieldErrors.occurredAt).toContain(
        'La fecha y hora debe tener formato ISO 8601.'
      );
    }
  });

  it('accepts clock skew up to 60 seconds and rejects later future dates', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const values = { eventType: 'general_note', description: 'Control diario' } as const;

    expect(
      createAnimalEventSchema().safeParse({
        ...values,
        occurredAt: new Date(now + ANIMAL_EVENT_FUTURE_TOLERANCE_MS).toISOString(),
      }).success
    ).toBe(true);

    const result = createAnimalEventSchema().safeParse({
      ...values,
      occurredAt: new Date(now + ANIMAL_EVENT_FUTURE_TOLERANCE_MS + 1).toISOString(),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.occurredAt).toContain(
        'La fecha y hora no puede estar en el futuro.'
      );
    }

    jest.restoreAllMocks();
  });

  it('accepts an occurredAt exactly at the local start of the intake day', () => {
    const intakeDate = '2026-08-15';
    const start = localDayStart(intakeDate) as Date;

    expect(
      createAnimalEventSchema(intakeDate).safeParse({
        eventType: 'general_note',
        description: 'Llegó al refugio.',
        occurredAt: start.toISOString(),
      }).success
    ).toBe(true);
  });

  it('rejects an occurredAt before the intake day', () => {
    const intakeDate = '2026-08-15';
    const start = localDayStart(intakeDate) as Date;
    const before = new Date(start.getTime() - 1000);

    const result = createAnimalEventSchema(intakeDate).safeParse({
      eventType: 'transfer',
      description: 'Traslado previo al ingreso.',
      occurredAt: before.toISOString(),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.occurredAt).toContain(
        'La fecha y hora no puede ser anterior al ingreso del animal.'
      );
    }
  });
});
