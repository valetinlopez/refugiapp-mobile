import { ApiError } from '@/core/api';

import { toVeterinarianErrorMessage, veterinarianFullName } from './veterinarianPresentation';
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
