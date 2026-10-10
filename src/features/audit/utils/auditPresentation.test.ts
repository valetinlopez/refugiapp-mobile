import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCE_TYPES,
  auditActionLabel,
  auditRangeError,
  auditResourceTypeLabel,
  buildAuditFilters,
  formatAuditDateBoth,
  formatAuditIdentifier,
  isHighRiskAuditAction,
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

  it('maps every supported action to a Spanish label', () => {
    expect(AUDIT_ACTIONS.length).toBe(31);
    for (const action of AUDIT_ACTIONS) {
      expect(auditActionLabel(action).trim()).not.toBe('');
      expect(auditActionLabel(action)).not.toContain('.');
    }
    expect(auditActionLabel('user.create')).toBe('Usuario creado');
    expect(auditActionLabel('auth.password_change')).toBe('Contraseña cambiada');
    expect(auditActionLabel('push.token_invalid')).toBe('Token de notificación inválido');
    expect(auditActionLabel('adoption.complete')).toBe('Adopción completada');
  });

  it('maps every supported resource type to a Spanish label', () => {
    expect(AUDIT_RESOURCE_TYPES).toEqual([
      'user',
      'medical_record',
      'expense',
      'care_task',
      'auth_session',
      'authorization',
      'notification',
      'adopter',
      'adoption_application',
      'adoption',
    ]);
    for (const resourceType of AUDIT_RESOURCE_TYPES) {
      expect(auditResourceTypeLabel(resourceType).trim()).not.toBe('');
    }
    expect(auditResourceTypeLabel('user')).toBe('Usuario');
    expect(auditResourceTypeLabel('medical_record')).toBe('Registro clínico');
  });

  it('builds action, resource type, actor and date filters', () => {
    const filters = buildAuditFilters(
      'access.denied',
      'authorization',
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-42d3-a456-426614174000',
      '2026-09-01',
      '2026-09-02'
    );
    expect(filters.action).toBe('access.denied');
    expect(filters.resourceType).toBe('authorization');
    expect(filters.actorUserId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(filters.resourceId).toBe('223e4567-e89b-42d3-a456-426614174000');
    expect(filters.from).toContain('2026-09-01T00:00:00');
    expect(filters.to).toContain('2026-09-02T23:59:00');
  });

  it('drops an invalid actor UUID without failing', () => {
    const filters = buildAuditFilters(undefined, undefined, 'not-a-uuid', 'also-invalid', '', '');
    expect(filters.actorUserId).toBeUndefined();
    expect(filters).toEqual({});
  });

  it('builds filters with only some dimensions', () => {
    expect(buildAuditFilters('expense.create', undefined, '', '', '', '')).toEqual({
      action: 'expense.create',
    });
    expect(buildAuditFilters(undefined, 'notification', '', '', '', '')).toEqual({
      resourceType: 'notification',
    });
  });

  it('validates incomplete and inverted ranges', () => {
    expect(auditRangeError('2026-09-01', '')).toBe('Definí las dos fechas del período.');
    expect(auditRangeError('2026-09-02', '2026-09-01')).toBe(
      'La fecha desde no puede ser posterior a la fecha hasta.'
    );
  });

  it('combines relative and absolute audit dates', () => {
    const recent = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatAuditDateBoth(recent)).toContain('hace');
    expect(formatAuditDateBoth(recent)).toContain('·');
    expect(formatAuditDateBoth('2026-01-01T10:00:00.000Z')).not.toContain('hace');
    expect(formatAuditDateBoth('nope')).toBe('Fecha no disponible');
  });

  it('marks security failures as high risk without relying on color alone', () => {
    expect(isHighRiskAuditAction('access.denied')).toBe(true);
    expect(isHighRiskAuditAction('auth.login_failure')).toBe(true);
    expect(isHighRiskAuditAction('user.create')).toBe(false);
  });

  it('shortens resource identifiers without exposing the complete value in the list', () => {
    expect(formatAuditIdentifier('223e4567-e89b-42d3-a456-426614174000')).toBe('223e4567…');
    expect(formatAuditIdentifier(null)).toBe('Sin identificador');
  });
});
