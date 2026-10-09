import { ApiError } from '@/core/api';

import {
  hasActiveVeterinarianFilters,
  toVeterinarianAdvancedFilters,
  toVeterinarianErrorMessage,
  toVeterinarianSearchFilter,
  veterinarianAccessibilityLabel,
  veterinarianContactEmail,
  veterinarianContactPhone,
  veterinarianFullName,
  veterinarianInitials,
} from './veterinarianPresentation';
import type { VeterinarianResponse } from '../types';

const VETERINARIAN: VeterinarianResponse = {
  id: '11111111-1111-4111-8111-111111111111',
  firstName: 'Sofía',
  lastName: 'Romero',
  licenseNumber: 'VET-001',
  isActive: true,
};

function apiError(status: number, code = 'ERROR'): ApiError {
  return new ApiError({ code, message: 'Message', requestId: 'request-id', status });
}

describe('veterinarianFullName', () => {
  it('combines first and last name', () => {
    expect(veterinarianFullName(VETERINARIAN)).toBe('Sofía Romero');
  });
});

describe('toVeterinarianErrorMessage', () => {
  it('translates a duplicated license number', () => {
    expect(toVeterinarianErrorMessage(apiError(409, 'LICENSE_NUMBER_ALREADY_EXISTS'))).toBe(
      'Ya existe un veterinario con esa matrícula.'
    );
  });

  it('translates a user already linked to another veterinarian', () => {
    expect(toVeterinarianErrorMessage(apiError(409, 'USER_ALREADY_LINKED_TO_VETERINARIAN'))).toBe(
      'Ese usuario ya está vinculado a otro veterinario.'
    );
  });

  it('translates an email already registered as a user', () => {
    expect(toVeterinarianErrorMessage(apiError(409, 'EMAIL_ALREADY_EXISTS'))).toBe(
      'Ese email ya está registrado como usuario. Usá otro o contactá a un administrador.'
    );
  });

  it('translates a conflicting userId and createUser payload', () => {
    expect(toVeterinarianErrorMessage(apiError(400, 'VET_USER_PAYLOAD_CONFLICT'))).toBe(
      'No se puede vincular un usuario y crear otro a la vez. Elegí una sola opción.'
    );
  });

  it('translates a missing email when creating a user', () => {
    expect(toVeterinarianErrorMessage(apiError(400, 'VET_CREATE_USER_EMAIL_REQUIRED'))).toBe(
      'Falta el email para crear el acceso. Completá el email del veterinario o del usuario.'
    );
  });

  it('translates a veterinarian that is already active', () => {
    expect(toVeterinarianErrorMessage(apiError(409, 'VETERINARIAN_ALREADY_ACTIVE'))).toBe(
      'Este veterinario ya está activo.'
    );
  });

  it('translates a 403 response', () => {
    expect(toVeterinarianErrorMessage(apiError(403))).toBe(
      'Tu rol no tiene permiso para gestionar veterinarios.'
    );
  });

  it('translates a 404 response', () => {
    expect(toVeterinarianErrorMessage(apiError(404))).toBe('El veterinario ya no está disponible.');
  });

  it('delegates unknown errors to the core fallback', () => {
    const error = apiError(500, 'UNKNOWN_SERVER_ERROR');
    const message = toVeterinarianErrorMessage(error);

    expect(message).toBe(error.message);
    expect(message).not.toContain('request-id');
    expect(message).not.toContain('UNKNOWN_SERVER_ERROR');
  });

  it('never leaks payload or tokens on generic errors', () => {
    const message = toVeterinarianErrorMessage(new Error('Bearer secret-token'));

    expect(message).not.toContain('secret-token');
  });
});

describe('toVeterinarianCreateErrorPresentation', () => {
  it('places a duplicated license next to the license field', () => {
    expect(
      toVeterinarianCreateErrorPresentation(apiError(409, 'LICENSE_NUMBER_ALREADY_EXISTS'))
    ).toEqual({
      field: 'licenseNumber',
      message: 'Ya existe un veterinario con esa matrícula.',
    });
  });

  it.each(['EMAIL_ALREADY_EXISTS', 'USER_ALREADY_LINKED_TO_VETERINARIAN'])(
    'places %s next to the access email field',
    (code) => {
      expect(toVeterinarianCreateErrorPresentation(apiError(409, code))).toEqual({
        field: 'createUserEmail',
        message: toVeterinarianErrorMessage(apiError(409, code)),
      });
    }
  );

  it('keeps non-field errors at form level', () => {
    expect(toVeterinarianCreateErrorPresentation(apiError(403))).toEqual({
      field: null,
      message: 'Tu rol no tiene permiso para gestionar veterinarios.',
    });
  });
});

describe('toVeterinarianSearchFilter', () => {
  it('returns an empty filter for blank input', () => {
    expect(toVeterinarianSearchFilter('')).toEqual({});
    expect(toVeterinarianSearchFilter('   ')).toEqual({});
  });

  it('filters by name when the term has no digits', () => {
    expect(toVeterinarianSearchFilter('Sofía')).toEqual({ name: 'Sofía' });
    expect(toVeterinarianSearchFilter('  Romero  ')).toEqual({ name: 'Romero' });
  });

  it('filters by license number when the term contains digits', () => {
    expect(toVeterinarianSearchFilter('VET-001')).toEqual({ licenseNumber: 'VET-001' });
    expect(toVeterinarianSearchFilter('MN 12345')).toEqual({ licenseNumber: 'MN 12345' });
  });
});

describe('veterinarianInitials', () => {
  it('builds uppercase initials from first and last name', () => {
    expect(veterinarianInitials(VETERINARIAN)).toBe('SR');
  });
});

describe('veterinarianContactEmail', () => {
  it('prefers the professional email of the profile', () => {
    expect(
      veterinarianContactEmail({
        ...VETERINARIAN,
        email: 'vet@refugiapp.local',
      })
    ).toBe('vet@refugiapp.local');
  });

  it('falls back to the linked user email', () => {
    const linkedUser = { email: 'user@refugiapp.local' } as NonNullable<
      VeterinarianResponse['user']
    >;

    expect(
      veterinarianContactEmail({
        ...VETERINARIAN,
        email: null,
        user: linkedUser,
      })
    ).toBe('user@refugiapp.local');
  });

  it('returns undefined instead of a placeholder when there is no email', () => {
    expect(veterinarianContactEmail({ ...VETERINARIAN, email: '   ' })).toBeUndefined();
  });
});

describe('veterinarianContactPhone', () => {
  it('trims the phone and returns undefined when blank', () => {
    expect(veterinarianContactPhone({ ...VETERINARIAN, phone: ' 1145550101 ' })).toBe('1145550101');
    expect(veterinarianContactPhone({ ...VETERINARIAN, phone: null })).toBeUndefined();
  });
});

describe('toVeterinarianAdvancedFilters', () => {
  it('omits blank fields', () => {
    expect(toVeterinarianAdvancedFilters('  ', '')).toEqual({});
  });

  it('trims and sends both filters together', () => {
    expect(toVeterinarianAdvancedFilters(' Romero ', ' VET-001 ')).toEqual({
      name: 'Romero',
      licenseNumber: 'VET-001',
    });
  });
});

describe('hasActiveVeterinarianFilters', () => {
  it('is false only when the default status has no search', () => {
    expect(hasActiveVeterinarianFilters({}, 'all')).toBe(false);
  });

  it('is true for a non-default status or any search term', () => {
    expect(hasActiveVeterinarianFilters({}, 'inactive')).toBe(true);
    expect(hasActiveVeterinarianFilters({ name: 'Romero' }, 'all')).toBe(true);
    expect(hasActiveVeterinarianFilters({ licenseNumber: 'VET-001' }, 'all')).toBe(true);
  });
});

describe('veterinarianAccessibilityLabel', () => {
  it('concatenates identity, license, contact and state', () => {
    expect(
      veterinarianAccessibilityLabel({
        ...VETERINARIAN,
        email: 'vet@refugiapp.local',
        phone: '1145550101',
      })
    ).toBe(
      'Sofía Romero, matrícula VET-001, email vet@refugiapp.local, teléfono 1145550101, Activo'
    );
  });

  it('omits missing contact lines and never leaks a UUID', () => {
    const label = veterinarianAccessibilityLabel({ ...VETERINARIAN, isActive: false });

    expect(label).toBe('Sofía Romero, matrícula VET-001, Inactivo');
    expect(label).not.toContain(VETERINARIAN.id);
  });
});
