import { tabBarCurveArchPath, tabBarCurvePath } from './tabBarCurve';

describe('tabBarCurvePath', () => {
  it('anchors the arch at both top corners and closes along the bottom', () => {
    const width = 390;
    const height = 110;
    const curve = 14;

    expect(tabBarCurvePath(width, height, curve)).toBe(
      'M 0 14 C 97.5 0 292.5 0 390 14 L 390 110 L 0 110 Z'
    );
  });

  it('keeps the apex centered and symmetric across widths', () => {
    const path = tabBarCurvePath(320, 100, 12);
    const match = path.match(/C ([\d.]+) 0 ([\d.]+) 0/);

    expect(match).not.toBeNull();
    expect(Number(match?.[1]) + Number(match?.[2])).toBeCloseTo(320);
  });

  it('clamps a curve taller than the bar to the available height', () => {
    expect(tabBarCurvePath(100, 8, 40)).toBe('M 0 8 C 25 0 75 0 100 8 L 100 8 L 0 8 Z');
  });

  it('never returns negative coordinates for zero or negative input', () => {
    expect(tabBarCurvePath(-10, -5, -3)).toBe('M 0 0 C 0 0 0 0 0 0 L 0 0 L 0 0 Z');
  });
});

describe('tabBarCurveArchPath', () => {
  it('describes only the open top arch so the border does not wrap the sides', () => {
    expect(tabBarCurveArchPath(200, 10)).toBe('M 0 10 C 50 0 150 0 200 10');
  });

  it('floors negative curve values at zero', () => {
    expect(tabBarCurveArchPath(100, -5)).toBe('M 0 0 C 25 0 75 0 100 0');
  });
});
