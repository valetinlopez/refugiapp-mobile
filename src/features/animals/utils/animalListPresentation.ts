import type {
  Animal,
  AnimalListFilters,
  AnimalSex,
  AnimalStatus,
  PaginatedAnimals,
} from '../types';
import { ANIMAL_STATUS_ORDER, getStatusLabel } from './animalTransitions';

export type AnimalStatusFilter = AnimalStatus | 'all';
export type AnimalSexFilter = AnimalSex | 'all';

export const ANIMAL_STATUS_FILTER_OPTIONS: readonly {
  id: AnimalStatusFilter;
  label: string;
}[] = [
  { id: 'all', label: 'Todos' },
  ...ANIMAL_STATUS_ORDER.map((status) => ({ id: status, label: getStatusLabel(status) })),
];

export const ANIMAL_SEX_FILTER_OPTIONS: readonly { id: AnimalSexFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'female', label: 'Hembra' },
  { id: 'male', label: 'Macho' },
  { id: 'unknown', label: 'Desconocido' },
];

export function getAnimalSexFilterLabel(sex: AnimalSexFilter): string {
  return ANIMAL_SEX_FILTER_OPTIONS.find((option) => option.id === sex)?.label ?? 'Todos';
}

/**
 * Flattens infinite-query pages preserving the backend order and dropping
 * duplicated UUIDs from overlapping pages.
 */
export function flattenAnimalPages(pages: readonly PaginatedAnimals[] | undefined): Animal[] {
  const seen = new Set<string>();
  const animals: Animal[] = [];

  for (const page of pages ?? []) {
    for (const animal of page.items) {
      if (seen.has(animal.id)) continue;
      seen.add(animal.id);
      animals.push(animal);
    }
  }

  return animals;
}

/** Quick search sends only a trimmed partial name; blanks never narrow the query. */
export function toAnimalSearchFilter(search: string): AnimalListFilters {
  const term = search.trim();
  return term === '' ? {} : { name: term };
}

/**
 * Explicit filters from the advanced sheet. `species` stays free text because
 * the backend publishes no species catalog; `sex: 'all'` means no filter.
 */
export function toAnimalAdvancedFilters(
  species: string,
  sex: AnimalSex | undefined
): AnimalListFilters {
  const trimmedSpecies = species.trim();
  return {
    ...(trimmedSpecies !== '' ? { species: trimmedSpecies } : {}),
    ...(sex !== undefined ? { sex } : {}),
  };
}

export function hasActiveAnimalFilters(
  filters: AnimalListFilters,
  status: AnimalStatusFilter
): boolean {
  return (
    status !== 'all' ||
    (filters.name !== undefined && filters.name !== '') ||
    (filters.species !== undefined && filters.species !== '') ||
    filters.sex !== undefined
  );
}

export interface ActiveAnimalFilterChip {
  key: 'name' | 'sex' | 'species' | 'status';
  label: string;
}

/** Human-readable summary of the applied filters; never leaks UUIDs or enums. */
export function describeActiveAnimalFilters(
  filters: AnimalListFilters,
  status: AnimalStatusFilter
): ActiveAnimalFilterChip[] {
  const chips: ActiveAnimalFilterChip[] = [];

  if (status !== 'all') {
    chips.push({ key: 'status', label: getStatusLabel(status) });
  }
  if (filters.name !== undefined && filters.name !== '') {
    chips.push({ key: 'name', label: `Nombre: ${filters.name}` });
  }
  if (filters.species !== undefined && filters.species !== '') {
    chips.push({ key: 'species', label: `Especie: ${filters.species}` });
  }
  if (filters.sex !== undefined) {
    chips.push({ key: 'sex', label: getAnimalSexFilterLabel(filters.sex) });
  }

  return chips;
}

/** Single announced label for the whole grid card; never a raw UUID. */
export function animalGridAccessibilityLabel(animal: Animal, statusLabel: string): string {
  const identity = animal.breed ? `${animal.species}, ${animal.breed}` : animal.species;
  return `${animal.name}, ${identity}, ${statusLabel}`;
}

/**
 * Adaptive columns for the animals grid (D37 / RFG-170).
 *
 * Two columns only when the viewport is wide enough *and* the font scale keeps
 * cards legible; narrow viewports or amplified fonts fall back to one column
 * so no critical data is clipped.
 */
export function resolveAnimalGridColumns(width: number, fontScale: number): 1 | 2 {
  if (!Number.isFinite(width) || width <= 0) return 1;
  if (!Number.isFinite(fontScale) || fontScale <= 0) return 1;
  return width >= 600 && fontScale < 1.5 ? 2 : 1;
}
