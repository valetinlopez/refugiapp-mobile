import type {
  CreateVeterinarianRequest,
  UpdateVeterinarianRequest,
  VeterinarianResponse,
} from '../types';
import type { VeterinarianFormValues } from './veterinarianSchema';

export function toCreateVeterinarianRequest(
  values: VeterinarianFormValues
): CreateVeterinarianRequest {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    licenseNumber: values.licenseNumber,
    ...(values.email !== undefined ? { email: values.email } : {}),
    ...(values.phone !== undefined ? { phone: values.phone } : {}),
    ...(values.userId !== undefined ? { userId: values.userId } : {}),
    ...(values.notes !== undefined ? { notes: values.notes } : {}),
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
  if ((values.userId ?? null) !== (original.userId ?? null)) {
    patch.userId = values.userId ?? null;
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
    userId: veterinarian.userId ?? undefined,
    notes: veterinarian.notes ?? undefined,
  };
}
