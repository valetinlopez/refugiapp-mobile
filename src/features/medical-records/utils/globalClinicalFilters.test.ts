import { toLocalDateTimeIso } from '@/components/patterns';

import {
  filterRecordsByAnimal,
  getClinicalDatePresetRange,
  hasActiveGlobalClinicalFilters,
  isValidClinicalDateRange,
  toClinicalDateFilterIso,
} from './globalClinicalFilters';

describe('toClinicalDateFilterIso', () => {
  it('spans the full local day so the end date is inclusive', () => {
    const result = toClinicalDateFilterIso({ from: '2026-09-22', to: '2026-09-22' });

    expect(result.from).toBe(toLocalDateTimeIso(new Date(2026, 8, 22, 0, 0, 0, 0)));
    expect(result.to).toBe(toLocalDateTimeIso(new Date(2026, 8, 22, 23, 59, 59, 999)));
  });

  it('drops invalid calendar values instead of sending them raw', () => {
    expect(toClinicalDateFilterIso({ from: 'not-a-date' })).toEqual({});
  });

  it('keeps only the provided bounds', () => {
    const result = toClinicalDateFilterIso({ from: '2026-09-01' });
    expect(result.from).toBe(toLocalDateTimeIso(new Date(2026, 8, 1, 0, 0, 0, 0)));
    expect(result.to).toBeUndefined();
  });
});

describe('isValidClinicalDateRange', () => {
  it('accepts an empty or single-sided range', () => {
    expect(isValidClinicalDateRange(undefined, undefined)).toBe(true);
    expect(isValidClinicalDateRange('2026-09-22', undefined)).toBe(true);
  });

  it('rejects a range whose start is after its end', () => {
    expect(isValidClinicalDateRange('2026-09-22', '2026-09-01')).toBe(false);
    expect(isValidClinicalDateRange('2026-09-01', '2026-09-22')).toBe(true);
  });

  it('rejects malformed calendar values', () => {
    expect(isValidClinicalDateRange('nope', '2026-09-22')).toBe(false);
  });
});

describe('getClinicalDatePresetRange', () => {
  const now = new Date(2026, 8, 22, 15, 30);

  it('computes the last seven and thirty day windows', () => {
    expect(getClinicalDatePresetRange('last7', now)).toEqual({
      from: '2026-09-16',
      to: '2026-09-22',
    });
    expect(getClinicalDatePresetRange('last30', now)).toEqual({
      from: '2026-08-24',
      to: '2026-09-22',
    });
  });

  it('computes the current month window', () => {
    expect(getClinicalDatePresetRange('thisMonth', now)).toEqual({
      from: '2026-09-01',
      to: '2026-09-22',
    });
  });
});

describe('hasActiveGlobalClinicalFilters', () => {
  it('detects no filters versus any active filter', () => {
    expect(hasActiveGlobalClinicalFilters(undefined, {})).toBe(false);
    expect(hasActiveGlobalClinicalFilters('consultation', {})).toBe(true);
    expect(hasActiveGlobalClinicalFilters(undefined, { from: '2026-09-01' })).toBe(true);
    expect(hasActiveGlobalClinicalFilters(undefined, { to: '2026-09-30' })).toBe(true);
  });
});

describe('filterRecordsByAnimal', () => {
  const records = [
    { id: 'a', animalId: 'animal-1' },
    { id: 'b', animalId: 'animal-2' },
    { id: 'c', animalId: 'animal-1' },
  ];

  it('returns a copy of the full list without an animal filter', () => {
    expect(filterRecordsByAnimal(records, undefined)).toHaveLength(3);
  });

  it('narrows to the animal on the loaded pages without reordering', () => {
    expect(filterRecordsByAnimal(records, 'animal-1').map(({ id }) => id)).toEqual(['a', 'c']);
  });
});
