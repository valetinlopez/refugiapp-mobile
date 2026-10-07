import { REFERENCE_VIEWPORTS } from './viewports';

describe('reference viewports (D06 / RFG-139)', () => {
  it('covers the six viewports required by the ticket', () => {
    expect(REFERENCE_VIEWPORTS.map((viewport) => viewport.label)).toEqual([
      '320 × 568',
      '390 × 844',
      'Tablet',
      'Horizontal',
      'Fuente 200 %',
      'Reduce motion',
    ]);
  });

  it('keeps stable ids and a verification detail per viewport', () => {
    expect(new Set(REFERENCE_VIEWPORTS.map((viewport) => viewport.id)).size).toBe(
      REFERENCE_VIEWPORTS.length
    );
    REFERENCE_VIEWPORTS.forEach((viewport) => {
      expect(viewport.id.length).toBeGreaterThan(0);
      expect(viewport.detail.length).toBeGreaterThan(0);
    });
  });
});
