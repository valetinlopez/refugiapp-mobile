import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AdoptionProcess } from './AdoptionProcess';
import { useApproveAdoption } from '../hooks/useAdoptionMutations';
import {
  useAdopter,
  useAdoptionApplications,
  useAdoptionHistory,
} from '../hooks/useAdoptionQueries';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../hooks/useAdoptionMutations', () => ({ useApproveAdoption: jest.fn() }));
jest.mock('../hooks/useAdoptionQueries', () => ({
  useAdopter: jest.fn(),
  useAdoptionApplications: jest.fn(),
  useAdoptionHistory: jest.fn(),
}));

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function infiniteResult(items: unknown[]) {
  return {
    data: { pages: [{ items, page: 1, limit: 20, total: items.length }] },
    error: null,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isPending: false,
    refetch: jest.fn(),
  };
}

function approveResult() {
  return {
    error: null,
    isPending: false,
    mutate: jest.fn(),
    reset: jest.fn(),
    variables: undefined,
  };
}

describe('AdoptionProcess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAdoptionApplications as jest.Mock).mockReturnValue(infiniteResult([]));
    (useAdoptionHistory as jest.Mock).mockReturnValue(infiniteResult([]));
    (useAdopter as jest.Mock).mockReturnValue({
      data: undefined,
      isError: false,
      isPending: false,
    });
    (useApproveAdoption as jest.Mock).mockReturnValue(approveResult());
  });

  it('protects personal data and management actions for veterinarians', async () => {
    const screen = await render(
      <AdoptionProcess
        animalId={ANIMAL_ID}
        animalName="Luna"
        canManage={false}
        isAvailableForAdoption
      />
    );

    expect(screen.queryByRole('button', { name: 'Nueva postulación' })).toBeNull();
    expect(screen.getByText(/no los datos personales ni las postulaciones/i)).toBeTruthy();
    expect(useAdoptionApplications).toHaveBeenCalledWith(ANIMAL_ID, false);
    expect(screen.getByText('Sin adopciones')).toBeTruthy();
  });

  it('requires explicit confirmation before approving a pending application', async () => {
    const mutation = approveResult();
    (useApproveAdoption as jest.Mock).mockReturnValue(mutation);
    (useAdoptionApplications as jest.Mock).mockReturnValue(
      infiniteResult([
        {
          id: 'application-id',
          animalId: ANIMAL_ID,
          adopterId: 'adopter-id',
          status: 'pending',
          submittedAt: '2026-10-05T12:00:00.000Z',
          createdAt: '2026-10-05T12:00:00.000Z',
          updatedAt: '2026-10-05T12:00:00.000Z',
        },
      ])
    );
    (useAdopter as jest.Mock).mockReturnValue({
      data: {
        id: 'adopter-id',
        firstName: 'Ana',
        lastName: 'Pérez',
        email: 'ana@example.com',
        phone: '+5491123456789',
      },
      isError: false,
      isPending: false,
    });
    const screen = await render(
      <AdoptionProcess animalId={ANIMAL_ID} animalName="Luna" canManage isAvailableForAdoption />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Aprobar postulación' }));
    expect(screen.getByText('Confirmar adopción')).toBeTruthy();
    expect(screen.getByText(/se rechazarán las demás pendientes/i)).toBeTruthy();
    expect(mutation.mutate).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('confirm-accept'));
    await waitFor(() =>
      expect(mutation.mutate).toHaveBeenCalledWith('application-id', expect.any(Object))
    );
  });

  it('disables writes when the animal is not available for adoption', async () => {
    const screen = await render(
      <AdoptionProcess
        animalId={ANIMAL_ID}
        animalName="Luna"
        canManage
        isAvailableForAdoption={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Nueva postulación' })).toBeDisabled();
    expect(screen.getByText(/primero el animal debe estar disponible/i)).toBeTruthy();
  });
});
