import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { REFERENCE_CASES } from './referenceCases';

/**
 * Extracts every concrete `app/...tsx` path mentioned in a D01 route annotation.
 * Annotations may reference two screens (e.g. "detalle y historial") or add
 * inline notes separated by spaces or `+`, so we collect all path tokens.
 */
function extractRoutePaths(route: string): string[] {
  return route.match(/app\/\S+\.tsx/g) ?? [];
}

describe('reference routes resolve to real screens (RFG-167 / deep links)', () => {
  it('maps every case to at least one existing file under app/', () => {
    const unresolved: string[] = [];

    REFERENCE_CASES.forEach((referenceCase) => {
      const routePaths = extractRoutePaths(referenceCase.route);
      if (routePaths.length === 0) {
        unresolved.push(`${referenceCase.id}: no app/...tsx path in route`);
        return;
      }
      routePaths.forEach((routePath) => {
        const absolutePath = resolve(process.cwd(), routePath);
        if (!existsSync(absolutePath)) {
          unresolved.push(`${referenceCase.id}: missing ${routePath}`);
        }
      });
    });

    expect(unresolved).toEqual([]);
  });
});
