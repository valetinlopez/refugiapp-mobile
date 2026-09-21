import { resolveTaskPresentation } from './TaskRow';

describe('resolveTaskPresentation', () => {
  const now = new Date('2026-09-20T12:00:00-03:00');

  it('gives overdue precedence over clinical context', () => {
    expect(
      resolveTaskPresentation({
        dueAt: new Date('2026-09-20T11:00:00-03:00'),
        isClinical: true,
        now,
        status: 'pending',
      })
    ).toEqual({ icon: 'alert', label: 'Vencida', tone: 'danger' });
  });

  it('uses clinical presentation when there is no urgency', () => {
    expect(resolveTaskPresentation({ isClinical: true, now, status: 'pending' })).toEqual({
      icon: 'medical',
      label: 'Clínica',
      tone: 'info',
    });
  });

  it('keeps terminal states independent from due date', () => {
    expect(
      resolveTaskPresentation({
        dueAt: new Date('2026-09-19T11:00:00-03:00'),
        now,
        status: 'completed',
      })
    ).toEqual({ icon: 'check', label: 'Completada', tone: 'positive' });
  });
});
