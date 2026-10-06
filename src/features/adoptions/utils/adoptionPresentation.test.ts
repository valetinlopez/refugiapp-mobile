import { getApplicationStatusLabel, getApplicationStatusTone } from './adoptionPresentation';

describe('adoption presentation', () => {
  it.each([
    ['pending', 'Pendiente', 'info'],
    ['approved', 'Aprobada', 'positive'],
    ['rejected', 'Rechazada', 'neutral'],
  ] as const)('presents %s without relying on color', (status, label, tone) => {
    expect(getApplicationStatusLabel(status)).toBe(label);
    expect(getApplicationStatusTone(status)).toBe(tone);
  });
});
