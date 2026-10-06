import type { CreateAdopterRequest } from '../types';
import type { AdopterFormValues } from './adoptionSchema';

export function toCreateAdopterRequest(values: AdopterFormValues): CreateAdopterRequest {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone,
    ...(values.address ? { address: values.address } : {}),
  };
}
