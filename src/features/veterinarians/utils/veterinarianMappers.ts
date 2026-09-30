import type {
  CreateVeterinarianRequest,
  UpdateVeterinarianRequest,
  VeterinarianResponse,
} from '../types';
import type { VeterinarianFormValues } from './veterinarianSchema';

export function toCreateVeterinarianRequest(
  values: VeterinarianFormValues
): CreateVeterinarianRequest {
  const request: CreateVeterinarianRequest = {
    firstName: values.firstName,
    lastName: values.lastName,
    licenseNumber: values.licenseNumber,
    ...(values.email !== undefined ? { email: values.email } : {}),
    ...(values.phone !== undefined ? { phone: values.phone } : {}),
    ...(values.notes !== undefined ? { notes: values.notes } : {}),
  };

  if (!values.shouldCreateUser) {
    return request;
  }

  return {
    ...request,
    createUser: {
      password: values.createUserPassword ?? '',
      ...(values.createUserEmail !== undefined ? { email: values.createUserEmail } : {}),
    },
  };
}

export function toUpdateVeterinarianRequest(
  values: VeterinarianFormValues,
  original: VeterinarianResponse
): UpdateVeterinarianRequest {
  const patch: UpdateVeterinarianRequest = {};

  if (values.firstName !== original.firstName) {
    patch.firstName = values.firstName;
  }
  if (values.lastName !== original.lastName) {
    patch.lastName = values.lastName;
  }
  if (values.licenseNumber !== original.licenseNumber) {
    patch.licenseNumber = values.licenseNumber;
  }
  if ((values.email ?? null) !== (original.email ?? null)) {
    patch.email = values.email ?? null;
  }
  if ((values.phone ?? null) !== (original.phone ?? null)) {
    patch.phone = values.phone ?? null;
  }
  if ((values.notes ?? null) !== (original.notes ?? null)) {
    patch.notes = values.notes ?? null;
  }

  return patch;
}

export function hasVeterinarianPatchChanges(patch: UpdateVeterinarianRequest): boolean {
  return Object.keys(patch).length > 0;
}

export function toVeterinarianFormValues(
  veterinarian: VeterinarianResponse
): VeterinarianFormValues {
  return {
    firstName: veterinarian.firstName,
    lastName: veterinarian.lastName,
    licenseNumber: veterinarian.licenseNumber,
    email: veterinarian.email ?? undefined,
    phone: veterinarian.phone ?? undefined,
    notes: veterinarian.notes ?? undefined,
    shouldCreateUser: false,
    createUserEmail: undefined,
    createUserPassword: undefined,
  };
}
