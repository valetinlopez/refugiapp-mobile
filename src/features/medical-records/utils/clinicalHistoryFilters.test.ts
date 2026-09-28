import { buildClinicalHistoryFilters, getCustomRangeError } from './clinicalHistoryFilters';

describe('buildClinicalHistoryFilters', () => {
  it('returns an empty filter for the whole period', () => {
    expect(buildClinicalHistoryFilters({ from: '', range: 'all', to: '' })).toEqual({});
  });

  it('applies only the record type when no range is selected', () => {
    expect(
      buildClinicalHistoryFilters({ from: '', range: 'all', recordType: 'surgery', to: '' })
    ).toEqual({ recordType: 'surgery' });
  });

  it('builds an ISO range for 30-day presets', () => {
    const before = new Date();
    const filters = buildClinicalHistoryFilters({
      from: '',
      range: 30,
      recordType: 'consultation',
      to: '',
    });

    expect(filters.recordType).toBe('consultation');
    expect(typeof filters.from).toBe('string');
    expect(typeof filters.to).toBe('string');
    const from = new Date(filters.from as string);
    const to = new Date(filters.to as string);
    expect(from.getTime()).toBeLessThan(to.getTime());
    expect(to.getTime()).toBeLessThanOrEqual(before.getTime());
  });

  it('builds a full local-day range for a valid custom period', () => {
    const filters = buildClinicalHistoryFilters({
      from: '2026-09-01',
      range: 'custom',
      recordType: 'deworming',
      to: '2026-09-28',
    });

    expect(filters.recordType).toBe('deworming');
    expect(filters.from).toMatch(/^2026-09-01T00:00:00/);
    expect(filters.to).toMatch(/^2026-09-28T23:59:00/);
    expect(new Date(filters.from as string).getTime()).toBeLessThan(
      new Date(filters.to as string).getTime()
    );
  });

  it('ignores the range when a custom period is incomplete', () => {
    expect(buildClinicalHistoryFilters({ from: '2026-09-01', range: 'custom', to: '' })).toEqual(
      {}
    );
    expect(buildClinicalHistoryFilters({ from: '', range: 'custom', to: '2026-09-28' })).toEqual(
      {}
    );
  });

  it('ignores the range when from is after to', () => {
    expect(
      buildClinicalHistoryFilters({ from: '2026-09-28', range: 'custom', to: '2026-09-01' })
    ).toEqual({});
  });

  it('keeps the record type when the custom range is invalid', () => {
    expect(
      buildClinicalHistoryFilters({
        from: '2026-09-28',
        range: 'custom',
        recordType: 'lab_result',
        to: '2026-09-01',
      })
    ).toEqual({ recordType: 'lab_result' });
  });
});

describe('getCustomRangeError', () => {
  it('explains that both dates are required', () => {
    expect(getCustomRangeError('', '')).toBe('Definí las dos fechas del período.');
    expect(getCustomRangeError('2026-09-01', '')).toBe('Definí las dos fechas del período.');
  });

  it('rejects a period where from is after to', () => {
    expect(getCustomRangeError('2026-09-28', '2026-09-01')).toBe(
      'La fecha desde no puede ser posterior a la fecha hasta.'
    );
  });

  it('accepts a valid period', () => {
    expect(getCustomRangeError('2026-09-01', '2026-09-28')).toBeNull();
    expect(getCustomRangeError('2026-09-28', '2026-09-28')).toBeNull();
  });
});
