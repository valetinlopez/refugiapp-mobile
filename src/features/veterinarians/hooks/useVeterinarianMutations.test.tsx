import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { veterinariansApi } from '../api/veterinariansApi';
import type { CreateVeterinarianRequest, VeterinarianResponse } from '../types';
import { veterinarianKeys } from './veterinarianKeys';
import {
  useCreateVeterinarian,
  useDeactivateVeterinarian,
  useReactivateVeterinarian,
  useUpdateVeterinarian,
} from './useVeterinarianMutations';

const VET_ID = '11111111-1111-4111-8111-111111111111';
const USER_ID = '22222222-2222-4222-8222-222222222222';
const createInput: CreateVeterinarianRequest = {
  firstName: 'Sofía',
  lastName: 'Romero',
  licenseNumber: 'VET-001',
  createUser: { email: 'vet@refugiapp.local', password: 'Refugia-2026-secure' },
};
const createdVeterinarian: VeterinarianResponse = {
  id: VET_ID,
  userId: USER_ID,
  firstName: createInput.firstName,
  lastName: createInput.lastName,
  licenseNumber: createInput.licenseNumber,
  email: null,
  phone: null,
  notes: null,
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('veterinarian mutations', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false, gcTime: 0 }, queries: { retry: false } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it.each([
    ['create', useCreateVeterinarian, createInput],
    ['update', useUpdateVeterinarian, { id: VET_ID, input: { phone: '+54 11 5555 0202' } }],
    ['deactivate', useDeactivateVeterinarian, VET_ID],
    ['reactivate', useReactivateVeterinarian, VET_ID],
  ] as const)(
    'invalidates the veterinarians prefix after %s succeeds',
    async (method, useMutation, input) => {
      const response = method === 'deactivate' ? undefined : createdVeterinarian;
      jest.spyOn(veterinariansApi, method).mockResolvedValue(response as never);
      const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
      const { result } = await renderHook(() => useMutation(), { wrapper });

      result.current.mutate(input as never);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidate).toHaveBeenCalledWith({ queryKey: veterinarianKeys.all });
    }
  );

  it('preserves cached clinical history when a veterinarian is deactivated', async () => {
    const clinicalHistoryKey = ['medical-records', 'by-veterinarian', VET_ID] as const;
    const clinicalHistory = [{ id: 'record-1', veterinarianId: VET_ID, title: 'Control anual' }];
    queryClient.setQueryData(clinicalHistoryKey, clinicalHistory);
    jest.spyOn(veterinariansApi, 'deactivate').mockResolvedValue(undefined);
    const { result } = await renderHook(() => useDeactivateVeterinarian(), { wrapper });

    result.current.mutate(VET_ID);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(clinicalHistoryKey)).toEqual(clinicalHistory);
  });
});
