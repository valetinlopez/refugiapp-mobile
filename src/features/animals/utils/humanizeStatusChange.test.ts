import { getStatusLabel } from './animalTransitions';
import {
  hasRawAnimalStatus,
  humanizeHistoryDescription,
  isAnimalStatus,
  parseStatusChange,
} from './humanizeStatusChange';
import type { AnimalStatus } from '../types';

const STATUSES: AnimalStatus[] = [
  'admitted',
  'under_treatment',
  'available_for_adoption',
  'adopted',
  'deceased',
];

describe('humanizeStatusChange', () => {
  it('keeps Spanish labels in sync with the status matrix', () => {
    expect(isAnimalStatus('adopted')).toBe(true);
    expect(isAnimalStatus('unknown')).toBe(false);
    for (const status of STATUSES) {
      expect(
        humanizeHistoryDescription({
          eventType: 'status_change',
          description: `Status changed from admitted to ${status}.`,
        })
      ).toContain(getStatusLabel(status));
    }
  });

  it('humanizes the ticket example without underscores or technical English', () => {
    const result = humanizeHistoryDescription({
      eventType: 'status_change',
      description: 'Status changed from available_for_adoption to adopted.',
    });

    expect(result).toBe('Cambió de Disponible para adopción a Adoptado');
    expect(result).not.toMatch(/_/);
    expect(hasRawAnimalStatus(result)).toBe(false);
  });

  it('parses quoted and cased backend variants', () => {
    expect(parseStatusChange('Status changed from "ADMITTED" to \'under_treatment\'.')).toEqual({
      from: 'admitted',
      to: 'under_treatment',
    });
    expect(parseStatusChange('sin transición')).toBeNull();
    expect(parseStatusChange('Status changed from admitted to unknown.')).toBeNull();
  });

  it('returns Sin valor for missing descriptions and never leaks UUIDs', () => {
    const uuid = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    expect(humanizeHistoryDescription({ eventType: 'status_change', description: '' })).toBe(
      'Sin valor'
    );
    expect(humanizeHistoryDescription({ eventType: 'status_change', description: '   ' })).toBe(
      'Sin valor'
    );

    const withUuid = humanizeHistoryDescription({
      eventType: 'status_change',
      description: `Transfer to ${uuid}`,
    });
    expect(withUuid).not.toContain(uuid);
    expect(withUuid).not.toMatch(/_/);
  });

  it('sanitizes stray enums outside the from/to sentence', () => {
    const result = humanizeHistoryDescription({
      eventType: 'status_change',
      description: 'Review available_for_adoption manually.',
    });

    expect(result).toContain('Disponible para adopción');
    expect(hasRawAnimalStatus(result)).toBe(false);
  });

  it('preserves non status_change descriptions while sanitizing enums', () => {
    expect(
      humanizeHistoryDescription({
        eventType: 'transfer',
        description: 'Traslado a hogar de tránsito.',
      })
    ).toBe('Traslado a hogar de tránsito.');
    expect(humanizeHistoryDescription({ eventType: 'general_note', description: '' })).toBe(
      'Sin valor'
    );
  });
});
