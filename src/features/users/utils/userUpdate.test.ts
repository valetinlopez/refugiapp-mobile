import type { UserResponse } from '../types';
import type { UpdateUserFormValues } from './userSchema';
import { hasRoleChanged, toUpdateUserPayload } from './userUpdate';

const initial: UserResponse = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'manager@refugiapp.local',
  firstName: 'Sofia',
  lastName: 'Ramirez',
  roles: ['shelter_manager'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const values: UpdateUserFormValues = {
  email: 'manager@refugiapp.local',
  firstName: 'Sofia',
  lastName: 'Ramirez',
  role: 'shelter_manager',
};

describe('toUpdateUserPayload', () => {
  it('returns null when nothing changed', () => {
    expect(toUpdateUserPayload(initial, values)).toBeNull();
  });

  it('includes only changed profile fields', () => {
    expect(
      toUpdateUserPayload(initial, {
        ...values,
        firstName: 'Sofía',
        email: 'nueva@refugiapp.local',
      })
    ).toEqual({ firstName: 'Sofía', email: 'nueva@refugiapp.local' });
  });

  it('sends roles only when the single managed role changed', () => {
    expect(toUpdateUserPayload(initial, { ...values, role: 'admin' })).toEqual({
      roles: ['admin'],
    });
  });

  it('treats a multi-role account as changed even with the same primary role', () => {
    const multiRole: UserResponse = { ...initial, roles: ['admin', 'veterinarian'] };
    expect(hasRoleChanged(multiRole, 'admin')).toBe(true);
    expect(toUpdateUserPayload(multiRole, { ...values, role: 'admin' })).toEqual({
      roles: ['admin'],
    });
  });
});
