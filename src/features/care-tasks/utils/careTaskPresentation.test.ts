import {
  formatCareTaskDate,
  getCareTaskDetailStatusPresentation,
  getCareTaskStatusPresentation,
} from './careTaskPresentation';

describe('care task presentation', () => {
  const now = new Date('2026-09-22T12:00:00.000Z');

  it('derives overdue only for pending tasks', () => {
    expect(getCareTaskStatusPresentation('pending', '2026-09-21T12:00:00.000Z', now)).toEqual({
      icon: 'alert',
      label: 'Vencida',
      tone: 'danger',
    });
    expect(getCareTaskStatusPresentation('completed', '2026-09-21T12:00:00.000Z', now)).toEqual({
      icon: 'check',
      label: 'Completada',
      tone: 'positive',
    });
  });

  it('presents pending, cancelled and upcoming with icon, text and tone', () => {
    expect(getCareTaskStatusPresentation('pending', null, now)).toEqual({
      icon: 'clock',
      label: 'Pendiente',
      tone: 'warning',
    });
    expect(getCareTaskStatusPresentation('pending', '2026-09-23T11:00:00.000Z', now)).toEqual({
      icon: 'clock',
      label: 'Próxima',
      tone: 'warning',
    });
    expect(getCareTaskStatusPresentation('pending', '2026-09-24T12:00:00.000Z', now)).toEqual({
      icon: 'clock',
      label: 'Pendiente',
      tone: 'warning',
    });
    expect(getCareTaskStatusPresentation('cancelled', null, now)).toEqual({
      icon: 'close',
      label: 'Cancelada',
      tone: 'neutral',
    });
  });

  it('formats empty dates safely', () => {
    expect(formatCareTaskDate(null)).toBe('Sin fecha');
  });

  it('keeps the persisted pending status alongside overdue and upcoming derivations', () => {
    expect(
      getCareTaskDetailStatusPresentation('pending', '2026-09-21T12:00:00.000Z', now)
    ).toMatchObject({
      primary: { label: 'Pendiente' },
      secondary: { label: 'Vencida' },
      message: 'Sigue pendiente · el vencimiento ya pasó.',
    });
    expect(
      getCareTaskDetailStatusPresentation('pending', '2026-09-23T11:00:00.000Z', now)
    ).toMatchObject({
      primary: { label: 'Pendiente' },
      secondary: { label: 'Próxima' },
    });
  });

  it('presents completed and cancelled as terminal states', () => {
    expect(getCareTaskDetailStatusPresentation('completed', null, now)).toMatchObject({
      primary: { label: 'Completada' },
    });
    expect(getCareTaskDetailStatusPresentation('cancelled', null, now)).toMatchObject({
      primary: { label: 'Cancelada' },
    });
  });
});
