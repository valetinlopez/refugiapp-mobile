import {
  ANIMAL_HISTORY_EVENT_TYPES,
  formatAnimalEventDate,
  getAnimalEventTypeLabel,
  getAnimalEventVisual,
} from './animalHistoryPresentation';

describe('getAnimalEventTypeLabel', () => {
  it('maps every backend event type to a Spanish label', () => {
    expect(getAnimalEventTypeLabel('intake')).toBe('Ingreso');
    expect(getAnimalEventTypeLabel('transfer')).toBe('Transferencia');
    expect(getAnimalEventTypeLabel('status_change')).toBe('Cambio de estado');
    expect(getAnimalEventTypeLabel('behavior_note')).toBe('Nota de comportamiento');
    expect(getAnimalEventTypeLabel('adoption')).toBe('Adopción');
    expect(getAnimalEventTypeLabel('general_note')).toBe('Nota general');
  });
});

describe('getAnimalEventVisual', () => {
  it('provides an icon and semantic tone for every contract event type', () => {
    expect(ANIMAL_HISTORY_EVENT_TYPES).toHaveLength(6);
    for (const eventType of ANIMAL_HISTORY_EVENT_TYPES) {
      expect(getAnimalEventVisual(eventType)).toEqual(
        expect.objectContaining({ icon: expect.any(String), tone: expect.any(String) })
      );
    }
  });
});

describe('formatAnimalEventDate', () => {
  it('formats an ISO date for the es-AR locale', () => {
    const value = formatAnimalEventDate('2026-09-21T14:30:00.000Z');
    expect(value).toBe(
      new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date('2026-09-21T14:30:00.000Z')
      )
    );
  });
});
