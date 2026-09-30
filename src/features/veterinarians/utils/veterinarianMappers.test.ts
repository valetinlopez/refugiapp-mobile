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
  user: {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'sofia@refugiapp.local',
    firstName: 'Sofía',
    lastName: 'Romero',
    roles: ['veterinarian'],
    isActive: true,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
};

const BASE_VALUES: VeterinarianFormValues = {
  firstName: 'Sofía',
  lastName: 'Romero',
  licenseNumber: 'VET-001',
  email: 'sofia@refugiapp.local',
  phone: '+54 11 5555 0101',
  notes: 'Especialista en felinos.',
  shouldCreateUser: false,
  createUserEmail: undefined,
  createUserPassword: undefined,
};

describe('toCreateVeterinarianRequest', () => {
  it('sends required fields and included optionals without a linked user', () => {
    expect(toCreateVeterinarianRequest(BASE_VALUES)).toEqual({
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'VET-001',
      email: 'sofia@refugiapp.local',
      phone: '+54 11 5555 0101',
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
      notes: undefined,
      shouldCreateUser: false,
      createUserEmail: undefined,
      createUserPassword: undefined,
    };

    const request = toCreateVeterinarianRequest(values);

    expect(request).toEqual({ firstName: 'Sofía', lastName: 'Romero', licenseNumber: 'VET-001' });
    expect(request).not.toHaveProperty('email');
    expect(request).not.toHaveProperty('phone');
    expect(request).not.toHaveProperty('notes');
    expect(request).not.toHaveProperty('createUser');
  });

  it('sends createUser with a nested email and password', () => {
    const values: VeterinarianFormValues = {
      ...BASE_VALUES,
      shouldCreateUser: true,
      createUserEmail: 'vet@refugiapp.local',
      createUserPassword: 'Refugia-2026-secure',
    };

    expect(toCreateVeterinarianRequest(values)).toEqual({
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'VET-001',
      email: 'sofia@refugiapp.local',
      phone: '+54 11 5555 0101',
      notes: 'Especialista en felinos.',
      createUser: {
        email: 'vet@refugiapp.local',
        password: 'Refugia-2026-secure',
      },
    });
  });

  it('sends createUser without a nested email so the backend falls back to the profile email', () => {
    const values: VeterinarianFormValues = {
      ...BASE_VALUES,
      shouldCreateUser: true,
      createUserPassword: 'Refugia-2026-secure',
    };

    const request = toCreateVeterinarianRequest(values);

    expect(request.createUser).toEqual({ password: 'Refugia-2026-secure' });
    expect(request.createUser).not.toHaveProperty('email');
  });

  it('never sends createUser when the toggle is off', () => {
    const values: VeterinarianFormValues = {
      ...BASE_VALUES,
      createUserEmail: 'vet@refugiapp.local',
      createUserPassword: 'Refugia-2026-secure',
    };

    expect(toCreateVeterinarianRequest(values)).not.toHaveProperty('createUser');
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
      notes: undefined,
      shouldCreateUser: false,
      createUserEmail: undefined,
      createUserPassword: undefined,
    };

    const patch = toUpdateVeterinarianRequest(values, ORIGINAL);

    expect(patch).toEqual({
      email: null,
      phone: null,
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
      user: null,
    };

    const patch = toUpdateVeterinarianRequest(
      toVeterinarianFormValues(originalWithoutOptionals),
      originalWithoutOptionals
    );

    expect(patch).toEqual({});
  });
});

describe('toVeterinarianFormValues', () => {
  it('maps null optional fields to undefined and disables create user', () => {
    const values = toVeterinarianFormValues({ ...ORIGINAL, email: null, user: null });

    expect(values.email).toBeUndefined();
    expect(values.shouldCreateUser).toBe(false);
    expect(values.createUserPassword).toBeUndefined();
  });
});
