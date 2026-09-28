import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { useSession } from '@/features/auth/session';
import { useAnimal } from '@/features/animals/hooks/useAnimal';
import { useAnimalPhoto } from '@/features/animals/hooks/useAnimalPhoto';
import { useChangeAnimalStatus } from '@/features/animals/hooks/useChangeAnimalStatus';
import { medicalRecordsApi } from '@/features/medical-records/api/medicalRecordsApi';

import AnimalDetailScreen from '../[id]';

jest.setTimeout(20000);

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

const ANIMAL = {
  id: ANIMAL_ID,
  name: 'Rocky',
  species: 'dog',
  breed: null,
  sex: 'male',
  status: 'admitted',
  intakeDate: '2026-01-10',
  birthDate: null,
  profilePhotoMediaId: null,
};

const CLINICAL_RECORD = {
  id: '0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14',
  animalId: ANIMAL_ID,
  veterinarianId: null,
  recordType: 'consultation',
  title: 'Consulta general',
  diagnosis: null,
  treatment: null,
  notes: null,
  occurredAt: '2026-09-22T14:30:00.000Z',
  createdAt: '2026-09-20T10:00:00.000Z',
  updatedAt: '2026-09-20T10:00:00.000Z',
};

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({ id: ANIMAL_ID })),
}));

jest.mock('@/features/auth/session', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/features/animals/hooks/useAnimal', () => ({
  useAnimal: jest.fn(),
}));

jest.mock('@/features/animals/hooks/useAnimalPhoto', () => ({
  useAnimalPhoto: jest.fn(),
}));

jest.mock('@/features/animals/hooks/useChangeAnimalStatus', () => ({
  useChangeAnimalStatus: jest.fn(),
}));

jest.mock('@/features/medical-records/api/medicalRecordsApi', () => ({
  medicalRecordsApi: { listByAnimal: jest.fn() },
}));

const mockUseSession = useSession as jest.Mock;
const mockUseAnimal = useAnimal as jest.Mock;
const mockUseAnimalPhoto = useAnimalPhoto as jest.Mock;
const mockUseChangeAnimalStatus = useChangeAnimalStatus as jest.Mock;

const { router, useLocalSearchParams } = jest.requireMock('expo-router') as {
  router: { back: jest.Mock; canGoBack: jest.Mock; replace: jest.Mock };
  useLocalSearchParams: jest.Mock;
};
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

function renderScreen() {
  queryClient = new QueryClient();
  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return render(<AnimalDetailScreen />, { wrapper });
}

let queryClient: QueryClient;

afterEach(() => {
  queryClient?.clear();
  queryClient?.unmount();
});

function mockAuthorizedAnimal() {
  mockUseAnimal.mockReturnValue({
    data: ANIMAL,
    isError: false,
    isPending: false,
  });
  mockUseAnimalPhoto.mockReturnValue({ data: undefined });
  mockUseChangeAnimalStatus.mockReturnValue({
    error: null,
    isPending: false,
    mutate: jest.fn(),
  });
}

describe('AnimalDetailScreen navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ id: ANIMAL_ID });
    mockUseSession.mockReturnValue({ user: { roles: ['admin'] } });
    mockUseAnimal.mockReturnValue({ data: undefined, isError: false, isPending: false });
    mockUseAnimalPhoto.mockReturnValue({ data: undefined });
    mockUseChangeAnimalStatus.mockReturnValue({ error: null, isPending: false, mutate: jest.fn() });
  });

  it('keeps the persistent back header when the animal is not found', async () => {
    const screen = await renderScreen();

    expect(screen.getByText('Animal no encontrado')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Volver' })).toHaveLength(2);
  });

  it('falls back to the explore list when opened as a deep link without history', async () => {
    router.canGoBack.mockReturnValue(false);
    const screen = await renderScreen();

    const backButtons = screen.getAllByRole('button', { name: 'Volver' });
    if (backButtons[0]) {
      await fireEvent.press(backButtons[0]);
    }

    expect(router.replace).toHaveBeenCalledWith('/explore');
    expect(router.back).not.toHaveBeenCalled();
  });
});

describe('AnimalDetailScreen clinical access by role', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ user: { roles: ['admin'] } });
    mockAuthorizedAnimal();
  });

  it('shows a restricted message and does not fetch clinical data for shelter_manager', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: ANIMAL_ID, tab: 'clinical' });
    mockUseSession.mockReturnValue({ user: { roles: ['shelter_manager'] } });

    const screen = await renderScreen();

    expect(screen.getByText('Acceso restringido')).toBeTruthy();
    expect(screen.getByText(/Tu rol no permite consultar datos clínicos/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Evolución clínica' })).toBeNull();
    expect(screen.queryByText('Cargando evolución clínica')).toBeNull();
    expect(medicalRecordsApi.listByAnimal).not.toHaveBeenCalled();
  });

  it('fetches and renders clinical history for admin', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: ANIMAL_ID, tab: 'clinical' });
    (medicalRecordsApi.listByAnimal as jest.Mock).mockResolvedValue({
      items: [CLINICAL_RECORD],
      page: 1,
      limit: 20,
      total: 1,
    });

    const screen = await renderScreen();

    expect(await screen.findByText('Consulta general')).toBeTruthy();
    expect(medicalRecordsApi.listByAnimal).toHaveBeenCalledWith(ANIMAL_ID, {});
  });

  it('fetches and renders clinical history for veterinarian', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: ANIMAL_ID, tab: 'clinical' });
    mockUseSession.mockReturnValue({ user: { roles: ['veterinarian'] } });
    (medicalRecordsApi.listByAnimal as jest.Mock).mockResolvedValue({
      items: [CLINICAL_RECORD],
      page: 1,
      limit: 20,
      total: 1,
    });

    const screen = await renderScreen();

    expect(await screen.findByText('Consulta general')).toBeTruthy();
    expect(medicalRecordsApi.listByAnimal).toHaveBeenCalledWith(ANIMAL_ID, {});
  });
});
