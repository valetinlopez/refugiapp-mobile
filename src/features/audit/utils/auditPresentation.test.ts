import {
  auditRangeError,
  buildAuditFilters,
  formatAuditDateBoth,
  sanitizeAuditMetadata,
} from './auditPresentation';

describe('auditPresentation', () => {
  it('removes sensitive metadata recursively', () => {
    expect(
      sanitizeAuditMetadata({
        email: 'a@b.com',
        token: 'secret',
        nested: { passwordHash: 'hash', reason: 'invalid' },
      })
    ).toEqual({
      email: 'a@b.com',
      nested: { reason: 'invalid' },
    });
  });

  it('builds supported action and date filters', () => {
    const filters = buildAuditFilters('access.denied', '2026-09-01', '2026-09-02');
    expect(filters.action).toBe('access.denied');
    expect(filters.from).toContain('2026-09-01T00:00:00');
    expect(filters.to).toContain('2026-09-02T23:59:00');
  });

  it('validates incomplete and inverted ranges', () => {
    expect(auditRangeError('2026-09-01', '')).toBe('Definí las dos fechas del período.');
    expect(auditRangeError('2026-09-02', '2026-09-01')).toBe(
      'La fecha desde no puede ser posterior a la fecha hasta.'
    );
  });

  it('combines relative and absolute audit dates', () => {
    expect(formatAuditDateBoth('2026-10-04T14:00:00.000Z')).toContain('hace');
    expect(formatAuditDateBoth('2026-10-04T14:00:00.000Z')).toContain('·');
    expect(formatAuditDateBoth('2026-01-01T10:00:00.000Z')).not.toContain('hace');
    expect(formatAuditDateBoth('nope')).toBe('Fecha no disponible');
  });
});
