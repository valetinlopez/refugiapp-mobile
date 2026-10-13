import { ApiError } from '@/core/api';

import type { MedicalRecordChange } from '../types';

import {
  buildChangeFilters,
  changeFieldsSummary,
  changeRangeError,
  formatChangeValue,
  formatPreviousChangeValue,
  getChangeFieldLabel,
  getChangeTypeLabel,
  getChangeTypeTone,
  toChangeErrorMessage,
} from './medicalRecordChangePresentation';

describe('getChangeTypeLabel', () => {
  it('maps every persisted change type to a Spanish label', () => {
    expect(getChangeTypeLabel('update')).toBe('Actualización');
    expect(getChangeTypeLabel('soft_delete')).toBe('Eliminación');
    expect(getChangeTypeLabel('restore')).toBe('Restauración');
  });
});

describe('getChangeTypeTone', () => {
  it('never relies on a single tone and keeps semantic mapping', () => {
    expect(getChangeTypeTone('update')).toBe('info');
    expect(getChangeTypeTone('soft_delete')).toBe('danger');
    expect(getChangeTypeTone('restore')).toBe('positive');
  });
});

describe('getChangeFieldLabel', () => {
  it('uses known Spanish labels for clinical fields', () => {
    expect(getChangeFieldLabel('recordType')).toBe('Tipo de registro');
    expect(getChangeFieldLabel('veterinarianId')).toBe('Veterinario');
    expect(getChangeFieldLabel('diagnosis')).toBe('Diagnóstico');
  });

  it('humanizes unknown field names without inventing data', () => {
    expect(getChangeFieldLabel('someUnknownField')).toBe('Some Unknown Field');
    expect(getChangeFieldLabel('')).toBe('');
  });
});

describe('formatChangeValue', () => {
  it('renders null and undefined as a safe value', () => {
    expect(formatChangeValue(null)).toBe('Sin valor');
    expect(formatChangeValue(undefined)).toBe('Sin valor');
  });

  it('truncates long strings without breaking layout', () => {
    const long = 'a'.repeat(300);
    const rendered = formatChangeValue(long);
    expect(rendered.endsWith('…')).toBe(true);
    expect(rendered.length).toBeLessThan(150);
  });

  it('keeps short strings intact', () => {
    expect(formatChangeValue('Diagnóstico actualizado')).toBe('Diagnóstico actualizado');
  });

  it('formats primitives safely', () => {
    expect(formatChangeValue(42)).toBe('42');
    expect(formatChangeValue(true)).toBe('true');
  });

  it('formats empty and non-empty arrays', () => {
    expect(formatChangeValue([])).toBe('Sin elementos');
    expect(formatChangeValue(['a', 'b'])).toBe('a, b');
  });

  it('serializes structured values defensively', () => {
    expect(formatChangeValue({ id: 'abc' })).toBe('{"id":"abc"}');
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(formatChangeValue(circular)).toBe('Valor no disponible');
  });
});

describe('formatPreviousChangeValue', () => {
  const vetId = '3fa85f64-5717-4562-b3fc-2c963f66afa1';
  const unknownVetId = '7fa85f64-5717-4562-b3fc-2c963f66afa9';
  const namesById = new Map([[vetId, 'Sofía Gómez']]);

  it('resolves a known veterinarian id from the shared directory', () => {
    expect(formatPreviousChangeValue('veterinarianId', vetId, namesById)).toBe('Sofía Gómez');
  });

  it('falls back explicitly for null without leaking a UUID', () => {
    expect(formatPreviousChangeValue('veterinarianId', null, namesById)).toBe(
      'Sin veterinario asignado'
    );
  });

  it('falls back explicitly for an inactive or out-of-page veterinarian', () => {
    const rendered = formatPreviousChangeValue('veterinarianId', unknownVetId, namesById);
    expect(rendered).toBe('Veterinario no disponible');
    expect(rendered).not.toContain(unknownVetId);
  });

  it('never renders a raw UUID for malformed veterinarian values', () => {
    expect(formatPreviousChangeValue('veterinarianId', 'not-a-uuid', namesById)).toBe(
      'Veterinario no disponible'
    );
    expect(formatPreviousChangeValue('veterinarianId', 42, namesById)).toBe(
      'Veterinario no disponible'
    );
  });

  it('keeps the defensive empty value for a missing previous veterinarian', () => {
    expect(formatPreviousChangeValue('veterinarianId', undefined, namesById)).toBe('Sin valor');
  });

  it('delegates every other field to the generic formatter', () => {
    expect(formatPreviousChangeValue('diagnosis', 'Prev', namesById)).toBe('Prev');
    expect(formatPreviousChangeValue('title', null, namesById)).toBe('Sin valor');
  });
});

describe('changeFieldsSummary', () => {
  const base: MedicalRecordChange = {
    id: 'change-1',
    medicalRecordId: 'record-1',
    changedByUserId: 'user-1',
    changeType: 'update',
    changedFields: ['title', 'diagnosis'],
    previousValues: { title: 'Antes', diagnosis: 'Prev' },
    changedAt: '2026-09-01T10:00:00.000Z',
    changedBy: null,
    changedByFallbackId: 'user-1',
  };

  it('summarizes a few fields', () => {
    expect(changeFieldsSummary(base)).toBe('Título, Diagnóstico');
  });

  it('collapses many fields with a count', () => {
    const change = { ...base, changedFields: ['a', 'b', 'c', 'd'] };
    expect(changeFieldsSummary(change)).toBe('A, B, C y 1 más');
  });

  it('handles an empty list', () => {
    expect(changeFieldsSummary({ ...base, changedFields: [] })).toBe('Sin campos registrados');
  });
});

describe('buildChangeFilters', () => {
  it('keeps only a supported change type', () => {
    expect(buildChangeFilters('update', '', '', '')).toEqual({ changeType: 'update' });
  });

  it('includes a valid actor UUID and drops invalid ones', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    expect(buildChangeFilters(undefined, uuid, '', '')).toEqual({ changedByUserId: uuid });
    expect(buildChangeFilters(undefined, 'not-a-uuid', '', '')).toEqual({});
  });

  it('builds a local-day range when both dates are present', () => {
    const filters = buildChangeFilters('soft_delete', '', '2026-09-01', '2026-09-02');
    expect(filters.changeType).toBe('soft_delete');
    expect(filters.from).toContain('2026-09-01T00:00:00');
    expect(filters.to).toContain('2026-09-02T23:59:00');
  });

  it('ignores an incomplete or inverted range', () => {
    expect(buildChangeFilters(undefined, '', '2026-09-01', '')).toEqual({});
    expect(buildChangeFilters(undefined, '', '2026-09-02', '2026-09-01')).toEqual({});
  });
});

describe('changeRangeError', () => {
  it('validates incomplete and inverted ranges', () => {
    expect(changeRangeError('2026-09-01', '')).toBe('Definí las dos fechas del período.');
    expect(changeRangeError('2026-09-02', '2026-09-01')).toBe(
      'La fecha desde no puede ser posterior a la fecha hasta.'
    );
    expect(changeRangeError('2026-09-01', '2026-09-02')).toBeNull();
  });
});

describe('toChangeErrorMessage', () => {
  const apiError = (status: number) =>
    new ApiError({
      code: `HTTP_${status}`,
      message: 'Server message',
      requestId: 'req-1',
      status,
    });

  it('translates forbidden access to a safe message', () => {
    expect(toChangeErrorMessage(apiError(403))).toContain('no tiene permiso');
  });

  it('translates a missing record', () => {
    expect(toChangeErrorMessage(apiError(404))).toContain('ya no está disponible');
  });

  it('falls back to a generic message for unknown errors', () => {
    expect(toChangeErrorMessage(new Error('boom'))).toBeTruthy();
  });
});
