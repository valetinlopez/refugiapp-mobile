import { formatActorName, getActorInitials, resolveActorLabel } from './actorPresentation';

describe('formatActorName', () => {
  it('joins and trims first and last name', () => {
    expect(formatActorName('María', 'López')).toBe('María López');
    expect(formatActorName('  Ana ', '  Ruiz ')).toBe('Ana Ruiz');
    expect(formatActorName('', '')).toBe('');
  });
});

describe('getActorInitials', () => {
  it('builds initials from the first letters', () => {
    expect(getActorInitials('María', 'López')).toBe('ML');
    expect(getActorInitials('ana', 'ruiz')).toBe('AR');
    expect(getActorInitials('', 'Ruiz')).toBe('R');
  });
});

describe('resolveActorLabel', () => {
  it('prefers the display name', () => {
    expect(resolveActorLabel('Ana Ruiz', 'some-uuid', 'Sistema')).toBe('Ana Ruiz');
  });

  it('falls back to the raw id during rollout when the actor is absent', () => {
    expect(resolveActorLabel(null, 'some-uuid', 'Sistema')).toBe('some-uuid');
    expect(resolveActorLabel(undefined, '  some-uuid  ', 'Sistema')).toBe('some-uuid');
  });

  it('uses the system label when actor and fallback are missing', () => {
    expect(resolveActorLabel(null, null, 'Sistema')).toBe('Sistema');
    expect(resolveActorLabel(undefined, undefined, 'Usuario del sistema')).toBe(
      'Usuario del sistema'
    );
  });
});
