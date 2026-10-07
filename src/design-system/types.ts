/**
 * Types for the internal visual-validation harness (D06 / RFG-139).
 *
 * The harness mirrors `docs/design-references/README.md` (D01 / RFG-134): every
 * reference becomes a deterministic, reproducible case with its route, visual
 * audience, relevant states, known divergences and required viewports. It never
 * invents endpoints, roles, states or permissions; it only catalogues what the
 * design references and the current contract already describe.
 */

export type ReferenceGroupId =
  'auth-account' | 'animals' | 'care' | 'expenses' | 'clinical' | 'veterinarians' | 'audit';

export const REFERENCE_STATES = [
  'default',
  'loading',
  'empty',
  'error',
  'offline',
  'restricted',
] as const;

export type ReferenceStateId = (typeof REFERENCE_STATES)[number];

export const DIVERGENCE_KINDS = ['implemented', 'contract', 'ux', 'pending'] as const;

export type DivergenceKind = (typeof DIVERGENCE_KINDS)[number];

export interface ReferenceDivergence {
  kind: DivergenceKind;
  /** Short, human-readable explanation kept in Spanish rioplatense. */
  note: string;
}

export interface ReferenceCase {
  /** Stable identifier used by tests and `RFG-167` regression selectors. */
  id: `D06-${string}`;
  /** Position of the reference in the walkthrough order (1..23). */
  index: number;
  /** Versioned reference file name in `docs/design-references/`. */
  referenceFile: string;
  /** Expo Router route that hosts the screen, or the planned route. */
  route: string;
  /** Visual audience copied from the D01 matrix (capabilities/roles as text). */
  audience: string;
  /** Screen states the case must exercise. */
  states: readonly ReferenceStateId[];
  /** Known divergences with the current implementation. */
  divergences: readonly ReferenceDivergence[];
  group: ReferenceGroupId;
}
