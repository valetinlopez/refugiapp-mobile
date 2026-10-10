import type { HomePriorityTask } from './homeApi';
import {
  buildHomePriorities,
  formatHomePriorityTime,
  resolveHomePriorityState,
} from './homePriorities';

const NOW = new Date('2026-10-10T12:00:00-03:00');

function task(overrides: Partial<HomePriorityTask> = {}): HomePriorityTask {
  return { animalId: 'animal', dueAt: null, id: 'task', title: 'Tarea', ...overrides };
}

describe('resolveHomePriorityState (D36 / RFG-169)', () => {
  it('marks a past dueAt as overdue', () => {
    expect(resolveHomePriorityState('2026-10-10T10:00:00-03:00', NOW)).toBe('overdue');
  });

  it('marks a dueAt within 24 hours as upcoming', () => {
    expect(resolveHomePriorityState('2026-10-10T20:00:00-03:00', NOW)).toBe('upcoming');
  });

  it('marks a far-future dueAt as pending', () => {
    expect(resolveHomePriorityState('2026-10-20T20:00:00-03:00', NOW)).toBe('pending');
  });

  it('treats a missing or invalid dueAt as pending', () => {
    expect(resolveHomePriorityState(null, NOW)).toBe('pending');
    expect(resolveHomePriorityState('', NOW)).toBe('pending');
    expect(resolveHomePriorityState('not-a-date', NOW)).toBe('pending');
  });
});

describe('buildHomePriorities (D36 / RFG-169)', () => {
  it('orders overdue first, then soonest, with undated tasks last', () => {
    const priorities = buildHomePriorities(
      [
        task({ id: 'undated', dueAt: null }),
        task({ id: 'later', dueAt: '2026-10-13T09:00:00-03:00' }),
        task({ id: 'overdue', dueAt: '2026-10-10T09:00:00-03:00' }),
        task({ id: 'soon', dueAt: '2026-10-10T13:00:00-03:00' }),
      ],
      NOW
    );

    expect(priorities.map((priority) => priority.id)).toEqual([
      'overdue',
      'soon',
      'later',
      'undated',
    ]);
    expect(priorities.map((priority) => priority.state)).toEqual([
      'overdue',
      'upcoming',
      'pending',
      'pending',
    ]);
  });

  it('breaks ties deterministically by id', () => {
    const priorities = buildHomePriorities(
      [
        task({ id: 'b', dueAt: '2026-10-10T13:00:00-03:00' }),
        task({ id: 'a', dueAt: '2026-10-10T13:00:00-03:00' }),
      ],
      NOW
    );

    expect(priorities.map((priority) => priority.id)).toEqual(['a', 'b']);
  });

  it('does not mutate the source list', () => {
    const source = [task({ id: 'b' }), task({ id: 'a' })];
    buildHomePriorities(source, NOW);
    expect(source.map((entry) => entry.id)).toEqual(['b', 'a']);
  });
});

describe('formatHomePriorityTime (D36 / RFG-169)', () => {
  it('formats the due time in es-AR without exposing the ISO string', () => {
    expect(formatHomePriorityTime('2026-10-10T11:00:00-03:00')).not.toBe(
      '2026-10-10T11:00:00-03:00'
    );
    expect(formatHomePriorityTime('2026-10-10T11:00:00-03:00')).toContain('11');
  });

  it('falls back to a readable label when there is no time', () => {
    expect(formatHomePriorityTime(null)).toBe('Sin hora');
    expect(formatHomePriorityTime('not-a-date')).toBe('Sin hora');
  });
});
