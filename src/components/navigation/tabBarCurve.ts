/**
 * Geometry for the curved bottom-navigation surface.
 *
 * The production tab bar (RFG-138) draws a subtle, static arch on its top edge
 * with `react-native-svg`. Keeping the path math pure lets the shape be unit
 * tested and reused by the bar without measuring layout at runtime.
 */

/**
 * Fill path for the bar surface: a symmetric cubic arch on the top edge that
 * falls to the straight sides and closes along the bottom.
 */
export function tabBarCurvePath(width: number, height: number, curve: number): string {
  const safeWidth = Math.max(width, 0);
  const safeHeight = Math.max(height, 0);
  const safeCurve = Math.min(Math.max(curve, 0), safeHeight);
  const controlX = safeWidth * 0.25;
  const controlXEnd = safeWidth - controlX;

  return [
    `M 0 ${safeCurve}`,
    `C ${controlX} 0 ${controlXEnd} 0 ${safeWidth} ${safeCurve}`,
    `L ${safeWidth} ${safeHeight}`,
    `L 0 ${safeHeight}`,
    'Z',
  ].join(' ');
}

/**
 * Open arch matching the fill's top edge, used to stroke a hairline border
 * without outlining the sides or the bottom.
 */
export function tabBarCurveArchPath(width: number, curve: number): string {
  const safeWidth = Math.max(width, 0);
  const safeCurve = Math.max(curve, 0);
  const controlX = safeWidth * 0.25;
  const controlXEnd = safeWidth - controlX;

  return `M 0 ${safeCurve} C ${controlX} 0 ${controlXEnd} 0 ${safeWidth} ${safeCurve}`;
}
