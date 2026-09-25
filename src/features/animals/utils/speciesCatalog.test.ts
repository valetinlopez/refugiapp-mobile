import type { Breed, Species } from '../types';

import {
  findSpeciesBySlug,
  isKnownCatalogValue,
  OTHER_OPTION_VALUE,
  toBreedOptions,
  toSpeciesOptions,
} from './speciesCatalog';

const SPECIES: Species[] = [
  { id: 'species-dog', slug: 'dog', labelEs: 'Perro' },
  { id: 'species-cat', slug: 'cat', labelEs: 'Gato' },
  { id: 'species-other', slug: 'other', labelEs: 'Otro' },
];

const BREEDS: Breed[] = [
  { id: 'breed-mestizo', speciesId: 'species-dog', slug: 'mestizo', labelEs: 'Mestizo' },
  {
    id: 'breed-labrador',
    speciesId: 'species-dog',
    slug: 'labrador-retriever',
    labelEs: 'Labrador retriever',
  },
];

describe('speciesCatalog', () => {
  it('maps species to catalog options using the slug as value', () => {
    expect(toSpeciesOptions(SPECIES)).toEqual([
      { label: 'Perro', value: 'dog' },
      { label: 'Gato', value: 'cat' },
      { label: 'Otro', value: 'other' },
    ]);
  });

  it('maps breeds to catalog options using the slug as value', () => {
    expect(toBreedOptions(BREEDS)).toEqual([
      { label: 'Mestizo', value: 'mestizo' },
      { label: 'Labrador retriever', value: 'labrador-retriever' },
    ]);
  });

  it('finds a species by exact trimmed slug', () => {
    expect(findSpeciesBySlug(SPECIES, 'dog')).toEqual(SPECIES[0]);
    expect(findSpeciesBySlug(SPECIES, '  dog  ')).toEqual(SPECIES[0]);
  });

  it('does not match species by case or label', () => {
    expect(findSpeciesBySlug(SPECIES, 'DOG')).toBeUndefined();
    expect(findSpeciesBySlug(SPECIES, 'Perro')).toBeUndefined();
    expect(findSpeciesBySlug(SPECIES, undefined)).toBeUndefined();
  });

  it('treats the "other" catalog slug as a known value', () => {
    expect(isKnownCatalogValue('other', toSpeciesOptions(SPECIES))).toBe(true);
  });

  it('recognizes empty and unknown values as not known', () => {
    const options = toSpeciesOptions(SPECIES);
    expect(isKnownCatalogValue(undefined, options)).toBe(false);
    expect(isKnownCatalogValue('', options)).toBe(false);
    expect(isKnownCatalogValue('hamster', options)).toBe(false);
  });

  it('exposes a sentinel distinct from real catalog values', () => {
    expect(OTHER_OPTION_VALUE).toBe('__other__');
    expect(toSpeciesOptions(SPECIES).some((option) => option.value === OTHER_OPTION_VALUE)).toBe(
      false
    );
  });
});
