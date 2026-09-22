import { createAnimalEventSchema, MANUAL_ANIMAL_EVENT_TYPES } from './createAnimalEventSchema';

describe('createAnimalEventSchema', () => {
  it.each(MANUAL_ANIMAL_EVENT_TYPES)('accepts the manual event type %s', (eventType) => {
    expect(
      createAnimalEventSchema.safeParse({ eventType, description: 'Novedad del animal.' }).success
    ).toBe(true);
  });

  it.each(['intake', 'status_change', 'adoption'])(
    'rejects the system event type %s',
    (eventType) => {
      const result = createAnimalEventSchema.safeParse({
        eventType,
        description: 'Evento reservado al sistema.',
      });

      expect(result.success).toBe(false);
    }
  );

  it('trims the description and omits an empty occurredAt', () => {
    expect(
      createAnimalEventSchema.parse({
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
    const result = createAnimalEventSchema.safeParse({
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
});
