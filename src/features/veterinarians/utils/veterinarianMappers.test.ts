import type { VeterinarianResponse } from '../types';
import {
  hasVeterinarianPatchChanges,
  toCreateVeterinarianRequest,
  toUpdateVeterinarianRequest,
  toVeterinarianFormValues,
} from './veterinarianMappers';
import type { VeterinarianFormValues } from './veterinarianSchema';

const ORIGINAL: VeterinarianResponse = {
  id: '11111111-1111-4111-8111-111111111111',
  userId: '22222222-2222-4222-8222-222222222222',
  firstName: 'Sofía',
  lastName: 'Romero',
  licenseNumber: 'VET-001',
  email: 'sofia@refugiapp.local',
  phone: '+54 11 5555 0101',
  notes: 'Especialista en felinos.',
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('toCreateVeterinarianRequest', () => {
  it('sends required fields and included optionals', () => {
    const values: VeterinarianFormValues = {
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'VET-001',
      email: 'sofia@refugiapp.local',
      phone: '+54 11 5555 0101',
      userId: '22222222-2222-4222-8222-222222222222',
      notes: 'Especialista en felinos.',
    };

    expect(toCreateVeterinarianRequest(values)).toEqual({
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'VET-001',
      email: 'sofia@refugiapp.local',
      phone: '+54 11 5555 0101',
      userId: '22222222-2222-4222-8222-222222222222',
      notes: 'Especialista en felinos.',
    });
  });

  it('omits optional fields when undefined', () => {
    const values: VeterinarianFormValues = {
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'VET-001',
      email: undefined,
      phone: undefined,
      userId: undefined,
      notes: undefined,
    };

    const request = toCreateVeterinarianRequest(values);

    expect(request).toEqual({ firstName: 'Sofía', lastName: 'Romero', licenseNumber: 'VET-001' });
    expect(request).not.toHaveProperty('email');
    expect(request).not.toHaveProperty('phone');
    expect(request).not.toHaveProperty('userId');
    expect(request).not.toHaveProperty('notes');
  });
});

describe('toUpdateVeterinarianRequest', () => {
  it('returns an empty patch when nothing changed', () => {
    const patch = toUpdateVeterinarianRequest(toVeterinarianFormValues(ORIGINAL), ORIGINAL);

    expect(patch).toEqual({});
    expect(hasVeterinarianPatchChanges(patch)).toBe(false);
  });

  it('sends changed required fields', () => {
    const values = toVeterinarianFormValues(ORIGINAL);
    const changed = { ...values, licenseNumber: 'VET-002' };

    const patch = toUpdateVeterinarianRequest(changed, ORIGINAL);

    expect(patch).toEqual({ licenseNumber: 'VET-002' });
    expect(hasVeterinarianPatchChanges(patch)).toBe(true);
  });

  it('sends null to clear optional fields', () => {
    const values: VeterinarianFormValues = {
      firstName: ORIGINAL.firstName,
      lastName: ORIGINAL.lastName,
      licenseNumber: ORIGINAL.licenseNumber,
      email: undefined,
      phone: undefined,
      userId: undefined,
      notes: undefined,
    };

    const patch = toUpdateVeterinarianRequest(values, ORIGINAL);

    expect(patch).toEqual({
      email: null,
      phone: null,
      userId: null,
      notes: null,
    });
  });

  it('omits untouched null optionals', () => {
    const originalWithoutOptionals: VeterinarianResponse = {
      ...ORIGINAL,
      userId: null,
      email: null,
      phone: null,
      notes: null,
    };

    const patch = toUpdateVeterinarianRequest(
      toVeterinarianFormValues(originalWithoutOptionals),
      originalWithoutOptionals
    );

    expect(patch).toEqual({});
  });
});

describe('toVeterinarianFormValues', () => {
  it('maps null optional fields to undefined', () => {
    const values = toVeterinarianFormValues({ ...ORIGINAL, email: null, userId: null });

    expect(values.email).toBeUndefined();
    expect(values.userId).toBeUndefined();
  });
});
