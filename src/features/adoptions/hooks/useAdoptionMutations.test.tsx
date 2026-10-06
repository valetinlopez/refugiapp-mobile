import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { adoptionsApi } from '../api/adoptionsApi';
import { adoptionKeys } from './adoptionKeys';
import { useApproveAdoption, useCreateAdoptionApplication } from './useAdoptionMutations';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

describe('adoption mutations', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('invalidates applications after creation and the complete process after approval', async () => {
    jest.spyOn(adoptionsApi, 'createAdopter').mockResolvedValue({ id: 'adopter-id' } as never);
    jest
      .spyOn(adoptionsApi, 'createApplication')
      .mockResolvedValue({ id: 'application-id' } as never);
    jest
      .spyOn(adoptionsApi, 'approveApplication')
      .mockResolvedValue({ id: 'adoption-id' } as never);
    const { client, wrapper } = setup();
    const invalidate = jest.spyOn(client, 'invalidateQueries');
    const { result, unmount } = await renderHook(
      () => ({
        create: useCreateAdoptionApplication(ANIMAL_ID),
        approve: useApproveAdoption(ANIMAL_ID),
      }),
      { wrapper }
    );

    act(() =>
      result.current.create.mutate({
        adopter: {
          firstName: 'Ana',
          lastName: 'Pérez',
          email: 'ana@example.com',
          phone: '+5491123456789',
        },
      })
    );
    await waitFor(() => expect(result.current.create.isSuccess).toBe(true));

    expect(adoptionsApi.createApplication).toHaveBeenCalledWith(ANIMAL_ID, {
      adopterId: 'adopter-id',
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: adoptionKeys.applications(ANIMAL_ID),
    });

    act(() => result.current.approve.mutate('application-id'));
    await waitFor(() => expect(result.current.approve.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: adoptionKeys.animal(ANIMAL_ID) });
    unmount();
    client.clear();
  });
});
