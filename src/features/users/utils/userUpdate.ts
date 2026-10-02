import type { UpdateUserRequest, UserResponse } from '../types';
import type { UpdateUserFormValues } from './userSchema';

export function hasRoleChanged(initial: UserResponse, role: UpdateUserFormValues['role']): boolean {
  return initial.roles.length !== 1 || initial.roles[0] !== role;
}

export function toUpdateUserPayload(
  initial: UserResponse,
  values: UpdateUserFormValues
): UpdateUserRequest | null {
  const payload: UpdateUserRequest = {};

  if (values.firstName !== initial.firstName) {
    payload.firstName = values.firstName;
  }
  if (values.lastName !== initial.lastName) {
    payload.lastName = values.lastName;
  }
  if (values.email !== initial.email) {
    payload.email = values.email;
  }
  if (hasRoleChanged(initial, values.role)) {
    payload.roles = [values.role];
  }

  return Object.keys(payload).length === 0 ? null : payload;
}
