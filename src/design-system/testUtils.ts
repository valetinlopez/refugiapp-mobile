import type { ReferenceCase, ReferenceStateId } from './types';

/**
 * Builds the stable `RFG-167` selector for a per-state regression block
 * (`ds-case-D06-NN-<state>`) and for the default preview
 * (`ds-case-preview-D06-NN`). Keeping the builders here avoids scattering the
 * selector format across the catalog, the tests and the regression docs.
 */
export function referenceStatesTestId(
  referenceCaseId: ReferenceCase['id'],
  state: ReferenceStateId
): string {
  return `ds-case-${referenceCaseId}-${state}`;
}

export function referencePreviewTestId(referenceCaseId: ReferenceCase['id']): string {
  return `ds-case-preview-${referenceCaseId}`;
}
