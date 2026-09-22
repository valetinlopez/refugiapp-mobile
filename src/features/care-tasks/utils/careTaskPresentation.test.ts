import { formatCareTaskDate, getCareTaskStatusPresentation } from './careTaskPresentation';

describe('care task presentation', () => {
  const now = new Date('2026-09-22T12:00:00.000Z');

  it('derives overdue only for pending tasks', () => {
    expect(getCareTaskStatusPresentation('pending', '2026-09-21T12:00:00.000Z', now)).toEqual({
      label: 'Vencida',
      tone: 'danger',
    });
    expect(getCareTaskStatusPresentation('completed', '2026-09-21T12:00:00.000Z', now).label).toBe(
      'Completada'
    );
  });

  it('formats empty dates safely', () => {
    expect(formatCareTaskDate(null)).toBe('Sin fecha');
  });
});
