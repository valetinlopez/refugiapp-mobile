/**
 * Presentation helpers for dashboard animal rows (D38.2 / RFG-173).
 *
 * The backend sends `species` as free text in lower case ("saco", "puma"), so
 * the row normalizes it only for display, without touching the shared mappers.
 * An empty value degrades to a readable label; a raw enum, code or UUID is never
 * shown.
 */
export const SPECIES_FALLBACK_LABEL = 'Especie no registrada';

/**
 * Capitalizes the first letter of a species/breed label, keeping the rest as
 * sent. Idempotent for already-capitalized values and safe for accented letters.
 */
export function formatSpeciesLabel(species: string): string {
  const trimmed = species.trim();
  if (trimmed === '') return SPECIES_FALLBACK_LABEL;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
