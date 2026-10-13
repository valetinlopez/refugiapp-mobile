import type { Animal, PaginatedAnimals } from '../types';
import {
  animalGridAccessibilityLabel,
  describeActiveAnimalFilters,
  flattenAnimalPages,
  hasActiveAnimalFilters,
  resolveAnimalGridColumns,
  toAnimalAdvancedFilters,
  toAnimalSearchFilter,
} from './animalListPresentation';

function createAnimal(overrides: Partial<Animal> = {}): Animal {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Luna',
    species: 'cat',
    breed: 'Mestiza',
    sex: 'female',
    status: 'under_treatment',
    intakeDate: '2026-01-10',
    birthDate: null,
    profilePhotoMediaId: null,
    ...overrides,
  };
}

function createPage(items: Animal[], page = 1, total = items.length): PaginatedAnimals {
  return { items, page, limit: 20, total };
}

describe('flattenAnimalPages', () => {
  it('preserves backend order and drops duplicated uuids', () => {
    const luna = createAnimal();
    const toby = createAnimal({ id: '9fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Toby' });

    expect(flattenAnimalPages([createPage([luna, toby]), createPage([toby, luna], 2, 2)])).toEqual([
      luna,
      toby,
    ]);
  });

  it('returns an empty list without pages', () => {
    expect(flattenAnimalPages(undefined)).toEqual([]);
  });
});

describe('toAnimalSearchFilter', () => {
  it('trims the term and omits blank searches', () => {
    expect(toAnimalSearchFilter('  Luna  ')).toEqual({ name: 'Luna' });
    expect(toAnimalSearchFilter('   ')).toEqual({});
  });
});

describe('toAnimalAdvancedFilters', () => {
  it('keeps species as free text and omits blanks', () => {
    expect(toAnimalAdvancedFilters('  dog  ', 'female')).toEqual({
      species: 'dog',
      sex: 'female',
    });
    expect(toAnimalAdvancedFilters('   ', undefined)).toEqual({});
  });
});

describe('hasActiveAnimalFilters', () => {
  it('detects status, name, species and sex filters', () => {
    expect(hasActiveAnimalFilters({}, 'all')).toBe(false);
    expect(hasActiveAnimalFilters({}, 'admitted')).toBe(true);
    expect(hasActiveAnimalFilters({ name: 'Luna' }, 'all')).toBe(true);
    expect(hasActiveAnimalFilters({ species: 'dog' }, 'all')).toBe(true);
    expect(hasActiveAnimalFilters({ sex: 'male' }, 'all')).toBe(true);
  });
});

describe('describeActiveAnimalFilters', () => {
  it('resolves human labels without raw enums', () => {
    expect(
      describeActiveAnimalFilters(
        { name: 'Luna', species: 'dog', sex: 'female' },
        'under_treatment'
      )
    ).toEqual([
      { key: 'status', label: 'En tratamiento' },
      { key: 'name', label: 'Nombre: Luna' },
      { key: 'species', label: 'Especie: dog' },
      { key: 'sex', label: 'Hembra' },
    ]);
  });
});

describe('animalGridAccessibilityLabel', () => {
  it('includes breed when present and never a uuid', () => {
    const label = animalGridAccessibilityLabel(createAnimal(), 'En tratamiento');

    expect(label).toBe('Luna, cat, Mestiza, En tratamiento');
    expect(label).not.toContain('3fa85f64');
  });

  it('omits breed when absent', () => {
    expect(animalGridAccessibilityLabel(createAnimal({ breed: null }), 'Ingresado')).toBe(
      'Luna, cat, Ingresado'
    );
  });
});

describe('resolveAnimalGridColumns', () => {
  it('uses two columns on standard phones with standard fonts (D41)', () => {
    expect(resolveAnimalGridColumns(390, 1)).toBe(2);
    expect(resolveAnimalGridColumns(390, 1.5)).toBe(2);
    expect(resolveAnimalGridColumns(600, 1)).toBe(2);
    expect(resolveAnimalGridColumns(800, 1.25)).toBe(2);
  });

  it('falls back to one column on narrow viewports', () => {
    expect(resolveAnimalGridColumns(320, 1)).toBe(1);
    expect(resolveAnimalGridColumns(359, 1)).toBe(1);
    expect(resolveAnimalGridColumns(360, 1)).toBe(2);
  });

  it('falls back to one column with amplified fonts (200 %)', () => {
    expect(resolveAnimalGridColumns(390, 2)).toBe(1);
    expect(resolveAnimalGridColumns(800, 2)).toBe(1);
  });

  it('falls back to one column with invalid measures', () => {
    expect(resolveAnimalGridColumns(0, 1)).toBe(1);
    expect(resolveAnimalGridColumns(Number.NaN, 1)).toBe(1);
  });
});
