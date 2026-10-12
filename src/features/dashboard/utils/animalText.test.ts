import { formatSpeciesLabel, SPECIES_FALLBACK_LABEL } from './animalText';

describe('formatSpeciesLabel (D38.2 / RFG-173)', () => {
  it('capitalizes a lower-cased species sent by the backend', () => {
    expect(formatSpeciesLabel('saco')).toBe('Saco');
    expect(formatSpeciesLabel('puma')).toBe('Puma');
  });

  it('keeps the rest of the label untouched and is idempotent', () => {
    expect(formatSpeciesLabel('saco salchicha')).toBe('Saco salchicha');
    expect(formatSpeciesLabel('Saco')).toBe('Saco');
  });

  it('supports accented first letters', () => {
    expect(formatSpeciesLabel('águila')).toBe('Águila');
  });

  it('falls back to a readable label for empty or blank values', () => {
    expect(formatSpeciesLabel('')).toBe(SPECIES_FALLBACK_LABEL);
    expect(formatSpeciesLabel('   ')).toBe(SPECIES_FALLBACK_LABEL);
  });
});
