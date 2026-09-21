import {
  getAllowedTransitions,
  getStatusBadge,
  getStatusConsequence,
  getStatusLabel,
  isTerminalStatus,
} from './animalTransitions';

describe('animalTransitions', () => {
  describe('getAllowedTransitions', () => {
    it('matches the backend transition matrix for non-terminal statuses', () => {
      expect(getAllowedTransitions('admitted')).toEqual([
        'under_treatment',
        'available_for_adoption',
        'deceased',
      ]);
      expect(getAllowedTransitions('under_treatment')).toEqual([
        'admitted',
        'available_for_adoption',
        'deceased',
      ]);
      expect(getAllowedTransitions('available_for_adoption')).toEqual([
        'under_treatment',
        'adopted',
        'deceased',
      ]);
    });

    it('returns no transitions for terminal statuses', () => {
      expect(getAllowedTransitions('adopted')).toEqual([]);
      expect(getAllowedTransitions('deceased')).toEqual([]);
    });
  });

  describe('isTerminalStatus', () => {
    it('marks adopted and deceased as terminal', () => {
      expect(isTerminalStatus('adopted')).toBe(true);
      expect(isTerminalStatus('deceased')).toBe(true);
    });

    it('does not mark the rest as terminal', () => {
      for (const status of ['admitted', 'under_treatment', 'available_for_adoption'] as const) {
        expect(isTerminalStatus(status)).toBe(false);
      }
    });
  });

  describe('getStatusLabel', () => {
    it('returns the Spanish presentation label for every status', () => {
      expect(getStatusLabel('admitted')).toBe('Ingresado');
      expect(getStatusLabel('under_treatment')).toBe('En tratamiento');
      expect(getStatusLabel('available_for_adoption')).toBe('Disponible para adopción');
      expect(getStatusLabel('adopted')).toBe('Adoptado');
      expect(getStatusLabel('deceased')).toBe('Fallecido');
    });
  });

  describe('getStatusConsequence', () => {
    it('explains the consequence of terminal transitions', () => {
      expect(getStatusConsequence('adopted')).toContain('irreversible');
      expect(getStatusConsequence('deceased')).toContain('irreversible');
      expect(getStatusConsequence('deceased')).toContain('respeto');
    });

    it('explains non-terminal transitions without marking them final', () => {
      expect(getStatusConsequence('admitted')).not.toContain('irreversible');
      expect(getStatusConsequence('under_treatment')).toContain('tratamiento');
      expect(getStatusConsequence('available_for_adoption')).toContain('adopción');
    });
  });

  describe('getStatusBadge', () => {
    it('returns a text + icon + tone presentation (never color-only)', () => {
      const badge = getStatusBadge('available_for_adoption');
      expect(badge).toMatchObject({
        label: 'Disponible para adopción',
        icon: 'heart',
        tone: 'positive',
      });
    });

    it('keeps a respectful neutral badge for deceased', () => {
      const badge = getStatusBadge('deceased');
      expect(badge.tone).toBe('neutral');
      expect(badge.label).toBe('Fallecido');
    });
  });
});
